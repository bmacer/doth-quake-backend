import * as mongoose from "mongoose";

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const AiConversationSchema = new mongoose.Schema({
  conversationId: String,
  conversation: [
    {
      role: {
        type: String,
        enum: ["system", "user", "assistant"],
      },
      content: String,
    },
  ],
});

export type AiConversation = mongoose.Document & {
  conversationId: string;
  conversation: AiMessage[];
};
