import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AskAiDto } from './dto/ask-ai.dto';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  ask(@Body() dto: AskAiDto, @Headers('authorization') authorization?: string) {
    return this.aiService.ask(dto, authorization);
  }
}
