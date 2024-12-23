// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";

const server = express();
let cachedApp: express.Express;
const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }

  if (!isServerless) {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`🚀 Server ready at http://localhost:${port}`);
    });
  }

  return cachedApp;
}

// Convert to serverless handler format
export default async function handler(req: any, res: any) {
  res.status(200).send("Hello World");
}

// Convert to serverless handler format
// export default async function handler(req: any, res: any) {
//   const app = await bootstrap();
//   return app(req, res);
// }

// bootstrap();
