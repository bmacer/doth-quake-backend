import { Injectable } from "@nestjs/common";

@Injectable()
export class DothService {
  getHello(): string {
    return "Hello, World!";
  }
}
