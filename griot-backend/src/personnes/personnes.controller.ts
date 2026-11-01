import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PersonnesService } from './personnes.service';
import { CreatePersonneDto } from './dto/create-personne.dto';
import { UpdatePersonneDto } from './dto/update-personne.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('personnes')
@ApiBearerAuth()
@Controller('arbres/:arbreId/personnes')
export class PersonnesController {
  constructor(private readonly personnesService: PersonnesService) {}

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get()
  findAll(@Param('arbreId') arbreId: string) {
    return this.personnesService.findAll(arbreId);
  }

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get(':id')
  findOne(@Param('arbreId') arbreId: string, @Param('id') id: string) {
    return this.personnesService.findOne(arbreId, id);
  }

  // Un contributeur peut proposer un ajout ; le service ajuste
  // automatiquement le statut de vérification selon son rôle exact.
  @Roles('admin', 'editeur', 'contributeur')
  @Post()
  create(@Param('arbreId') arbreId: string, @Req() req, @Body() dto: CreatePersonneDto) {
    const roleAuteur = req.membreArbre.role;
    return this.personnesService.create(arbreId, roleAuteur, dto);
  }

  // Modification directe réservée à l'éditeur/admin (§7)
  @Roles('admin', 'editeur')
  @Patch(':id')
  update(@Param('arbreId') arbreId: string, @Param('id') id: string, @Body() dto: UpdatePersonneDto) {
    return this.personnesService.update(arbreId, id, dto);
  }

  @Roles('admin', 'editeur')
  @Patch(':id/valider')
  valider(@Param('arbreId') arbreId: string, @Param('id') id: string) {
    return this.personnesService.valider(arbreId, id);
  }

  @Roles('admin', 'editeur')
  @Delete(':id')
  remove(@Param('arbreId') arbreId: string, @Param('id') id: string) {
    return this.personnesService.remove(arbreId, id);
  }
}
