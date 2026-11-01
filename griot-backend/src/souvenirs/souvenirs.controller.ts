import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateSouvenirDto } from './dto/create-souvenir.dto';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { SouvenirsService } from './souvenirs.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('souvenirs')
@ApiBearerAuth()
@Controller('arbres/:arbreId/souvenirs')
export class SouvenirsController {
  constructor(private readonly souvenirsService: SouvenirsService) {}

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get()
  findAll(@Param('arbreId') arbreId: string) { return this.souvenirsService.findAll(arbreId); }

  @Roles('admin', 'editeur', 'contributeur')
  @Post()
  create(@Param('arbreId') arbreId: string, @Req() req, @Body() dto: CreateSouvenirDto) {
    return this.souvenirsService.create(arbreId, req.user.id, req.membreArbre.role, dto);
  }

  @Roles('admin', 'editeur')
  @Delete(':id')
  remove(@Param('arbreId') arbreId: string, @Param('id') id: string) { return this.souvenirsService.remove(arbreId, id); }

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get(':souvenirId/commentaires')
  listComments(@Param('arbreId') arbreId: string, @Param('souvenirId') souvenirId: string) {
    return this.souvenirsService.listComments(arbreId, souvenirId);
  }

  @Roles('admin', 'editeur', 'contributeur')
  @Post(':souvenirId/commentaires')
  createComment(
    @Param('arbreId') arbreId: string,
    @Param('souvenirId') souvenirId: string,
    @Req() req,
    @Body() dto: CreateCommentaireDto,
  ) {
    return this.souvenirsService.createComment(arbreId, souvenirId, req.user.id, dto);
  }

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Delete(':souvenirId/commentaires/:commentId')
  deleteComment(
    @Param('arbreId') arbreId: string,
    @Param('souvenirId') souvenirId: string,
    @Param('commentId') commentId: string,
    @Req() req,
  ) {
    return this.souvenirsService.removeComment(
      arbreId,
      souvenirId,
      commentId,
      req.user.id,
      req.membreArbre.role,
    );
  }
}
