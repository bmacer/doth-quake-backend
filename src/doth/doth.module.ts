// src/app.module.ts
import { Module } from "@nestjs/common";
import { DothController } from "./doth.controller";
import { DothService } from "./doth.service";

@Module({
  imports: [],
  controllers: [DothController],
  providers: [DothService],
  exports: [DothService],
})
export class DothModule {}
