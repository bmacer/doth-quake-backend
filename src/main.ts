// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";

const server = express();
let cachedApp: express.Express;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.init();

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
  });

  return cachedApp;
}

bootstrap();
