import { Controller, Get } from "@nestjs/common";
import { DothService } from "./doth.service";

@Controller("doth")
export class DothController {
  constructor(private readonly dothService: DothService) {}

  @Get()
  getHello(): string {
    return this.dothService.getHello();
  }
}
