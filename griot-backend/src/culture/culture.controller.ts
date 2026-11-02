import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CultureService } from './culture.service';
import { CarteDto, PublicationDto, PublicationQuery, ValidationCarteDto } from './culture.dto';

@ApiTags('culture') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('arbres/:arbreId/culture')
export class CultureController {
  constructor(private readonly service: CultureService) {}
  @Get('publications') @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  publications(@Param('arbreId') tree: string, @Query() query: PublicationQuery) { return this.service.publications(tree, query); }
  @Post('publications') @Roles('admin', 'editeur', 'contributeur')
  publish(@Param('arbreId') tree: string, @Req() req, @Body() dto: PublicationDto) { return this.service.publish(tree, req.user.id, dto); }
  @Delete('publications/:id') @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  removePost(@Param('arbreId') tree: string, @Param('id') id: string, @Req() req) { return this.service.removePublication(tree, id, req.user.id, req.membreArbre.role); }
  @Get('cartes') @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  cartes(@Param('arbreId') tree: string) { return this.service.cartes(tree); }
  @Post('cartes') @Roles('admin', 'editeur', 'contributeur')
  create(@Param('arbreId') tree: string, @Req() req, @Body() dto: CarteDto) { return this.service.createCarte(tree, req.user.id, dto); }
  @Patch('cartes/:id/validation') @Roles('admin', 'editeur')
  validate(@Param('arbreId') tree: string, @Param('id') id: string, @Body() dto: ValidationCarteDto) { return this.service.validateCarte(tree, id, dto.validee); }
  @Delete('cartes/:id') @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  remove(@Param('arbreId') tree: string, @Param('id') id: string, @Req() req) { return this.service.removeCarte(tree, id, req.user.id, req.membreArbre.role); }
  @Post('cartes/:id/audio') @Roles('admin', 'editeur', 'contributeur')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 512 * 1024, files: 1 } }))
  upload(@Param('arbreId') tree: string, @Param('id') id: string, @Req() req, @UploadedFile() file: { buffer: Buffer; mimetype: string }) { return this.service.saveAudio(tree, id, req.user.id, req.membreArbre.role, file); }
  @Get('cartes/:id/audio') @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  async audio(@Param('arbreId') tree: string, @Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const card = await this.service.audio(tree, id); res.setHeader('Cache-Control', 'private, no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    return new StreamableFile(card.audio!, { type: card.audioMime!, disposition: 'inline' });
  }
}
