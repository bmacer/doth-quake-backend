import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";

// Global Express instance
const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.init();
  return server;
}

// Cache the server instance
const serverPromise = bootstrap();

// Vercel handler
export default async function handler(req: any, res: any) {
  const serverInstance = await serverPromise;
  serverInstance(req, res); // Let Express handle the request
}
