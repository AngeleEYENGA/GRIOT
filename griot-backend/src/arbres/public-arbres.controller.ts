import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArbresService } from './arbres.service';

@ApiTags('arbres publics')
@Controller('arbres')
export class PublicArbresController {
  constructor(private readonly arbresService: ArbresService) {}

  @Get('publics')
  @ApiOperation({ summary: 'Rechercher des arbres dont le propriétaire a choisi la visibilité publique' })
  findPublic(@Query('recherche') recherche?: string) {
    return this.arbresService.findPublic(recherche);
  }

  @Get('presentations')
  @ApiOperation({ summary: 'Présentations publiques consultables sans compte' })
  presentations() { return this.arbresService.findPresentations(); }

  @Get('presentations/:id')
  @ApiOperation({ summary: 'Consulter un arbre dont le propriétaire a autorisé la présentation détaillée' })
  presentation(@Param('id', new ParseUUIDPipe()) id: string) { return this.arbresService.findPresentation(id); }
}
