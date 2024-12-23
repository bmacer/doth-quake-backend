// src/app.module.ts
import { Module } from "@nestjs/common";
import { DothController } from "./doth.controller";
import { DothService } from "./doth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AiConversationSchema } from "./doth.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "AiConversation", schema: AiConversationSchema },
    ]),
  ],
  controllers: [DothController],
  providers: [DothService],
  exports: [DothService],
})
export class DothModule {}
