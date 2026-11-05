import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArchiveSourceDto, ConsultationDto, CreateSourceDto, SourceQuery, UpdateSourceDto } from './knowledge.dto';
import { KnowledgeService } from './knowledge.service';

@ApiTags('knowledge-core') @ApiBearerAuth() @UseGuards(JwtAuthGuard)
@Controller('knowledge/sources')
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}
  @Get() list(@Req() req, @Query() query: SourceQuery) { return this.service.list(req.user.id, query); }
  @Post() create(@Req() req, @Body() dto: CreateSourceDto) { return this.service.create(req.user.id, dto); }
  @Get(':id') detail(@Req() req, @Param('id', new ParseUUIDPipe()) id: string) { return this.service.detail(req.user.id, id); }
  @Patch(':id') update(@Req() req, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateSourceDto) { return this.service.update(req.user.id, id, dto); }
  @Post(':id/archive') archive(@Req() req, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ArchiveSourceDto) { return this.service.archive(req.user.id, id, dto); }
  @Post(':id/consultations') consult(@Req() req, @Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ConsultationDto) { return this.service.consult(req.user.id, id, dto); }
}
