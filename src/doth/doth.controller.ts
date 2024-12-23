import { Controller, Get, Post, Body, Param, Inject } from "@nestjs/common";
import { DothService } from "./doth.service";

@Controller("doth")
export class DothController {
  constructor(
    @Inject(DothService)
    private readonly dothService: DothService
  ) {}

  @Post(":conversationId")
  async postMessage(
    @Param("conversationId") conversationId: string,
    @Body() body: any
  ) {
    console.log("🔌 <== test");
    console.log(body);
    let { message } = body;
    return await this.dothService.postMessage(message, conversationId);
  }

  @Get("history/:conversationId")
  async getHistory(@Param("conversationId") conversationId: string) {
    return await this.dothService.getHistoryWithoutSystemMessage(
      conversationId
    );
  }

  @Get("refetchBackgroundInfo")
  async refetchBackgroundInfo() {
    return await this.dothService.fetchWikiRepos();
  }
}
