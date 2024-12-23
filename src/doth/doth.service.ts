import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AiConversation, AiMessage } from "./doth.model";
import dotenv from "dotenv";
dotenv.config();

const XAI_URL = process.env.XAI_URL;
const GITHUB_WIKI_URL = process.env.GITHUB_WIKI_URL;
const INITIAL_ASSISTANT_MESSAGE = {
  role: "assistant",
  content: "I am Doth Quake and will help you in your Evrloot adventure",
};

const fetchAllFilePaths = async (path: string = "", token: string = "") => {
  const baseUrl = `${GITHUB_WIKI_URL}/${[path]}`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  try {
    const response = await fetch(baseUrl, { headers });
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();
    let filePaths = [];

    for (const item of data) {
      if (item.type === "file") {
        filePaths.push(item.path);
      } else if (item.type === "dir") {
        const subPaths = await fetchAllFilePaths(item.path, token);
        filePaths = filePaths.concat(subPaths);
      }
    }
    // instructions.md needs to be moved to the front of the array
    filePaths.unshift(
      filePaths.splice(filePaths.indexOf("instructions.md"), 1)[0]
    );
    return filePaths;
  } catch (error) {
    console.error("Error fetching file paths:", error.message);
    return [];
  }
};

@Injectable()
export class DothService {
  private githubWikiToken: string;
  private backgroundInfo: string;
  constructor(
    @InjectModel("AiConversation")
    private readonly aiConversationModel: Model<AiConversation>
  ) {
    this.githubWikiToken = process.env.GITHUB_WIKI_TOKEN;
    this.fetchWikiRepos();
  }

  async fetchWikiRepos() {
    const filePaths = await fetchAllFilePaths("", this.githubWikiToken);
    console.log(`[+] ${filePaths.length} files found`);
    console.log(filePaths);
    console.log(`[+] fetching wiki repos`);
    for (const page of filePaths) {
      try {
        const response = await fetch(`${GITHUB_WIKI_URL}/${page}`, {
          headers: {
            Authorization: `Bearer ${this.githubWikiToken}`,
          },
        });
        const data = await response.json();
        // Base64 decode the data
        const decodedData = Buffer.from(data.content, "base64").toString(
          "utf-8"
        );
        console.log(`[+] fetched ${page}`);
        this.backgroundInfo += decodedData;
      } catch (error) {
        console.error(`[x] Error fetching ${page}: ${error}`);
        continue;
      }
    }
  }

  private async getOrCreateConversation(
    conversationId: string
  ): Promise<AiConversation> {
    const conversation =
      (await this.aiConversationModel.findOne({ conversationId })) ||
      (await this.aiConversationModel.create({
        conversationId,
        conversation: [INITIAL_ASSISTANT_MESSAGE],
      }));
    return conversation;
  }

  async getHistory(conversationId: string): Promise<{
    conversationId: string;
    conversation: AiMessage[];
  }> {
    const conversation = await this.getOrCreateConversation(conversationId);
    return {
      conversationId,
      conversation: [
        { role: "system", content: this.backgroundInfo },
        ...conversation.conversation,
      ],
    };
  }

  async getHistoryWithoutSystemMessage(
    conversationId: string
  ): Promise<AiMessage[]> {
    const history = await this.getHistory(conversationId);
    return history.conversation.slice(1);
  }

  private async postMessageToXai(messages: AiMessage[]): Promise<string> {
    const response = await fetch(XAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        stream: false,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`XAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "No response";
  }

  private async addMessageToDb(
    content: string,
    conversationId: string,
    role: "user" | "assistant"
  ): Promise<void> {
    const conversation = await this.getOrCreateConversation(conversationId);
    conversation.conversation.push({ role, content });
    await conversation.save();
  }

  async postMessage(
    content: string,
    conversationId: string
  ): Promise<{ content: string }> {
    const history = await this.getHistory(conversationId);
    await this.addMessageToDb(content, conversationId, "user");

    const response = await this.postMessageToXai([
      ...history.conversation,
      { role: "user", content },
    ]);

    await this.addMessageToDb(response, conversationId, "assistant");
    return { content: response };
  }
}
