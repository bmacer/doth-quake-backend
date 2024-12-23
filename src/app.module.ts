// src/app.module.ts
import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { DothModule } from "./doth/doth.module";

@Module({
  imports: [DothModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
