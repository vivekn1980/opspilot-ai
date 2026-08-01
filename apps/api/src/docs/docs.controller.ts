import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { DocsService } from "./docs.service";
import { CreateDocDto } from "./dto/create-doc.dto";
import { ChatDto } from "./dto/chat.dto";

@Controller("docs")
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Post()
  create(@Body() dto: CreateDocDto) {
    return this.docsService.create(dto);
  }

  @Get()
  findAll() {
    return this.docsService.findAll();
  }

  @Post("chat")
  chat(@Body() dto: ChatDto) {
    return this.docsService.chat(dto.question);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.docsService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.docsService.remove(id);
  }
}
