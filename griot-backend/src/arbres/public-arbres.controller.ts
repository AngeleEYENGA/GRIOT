import { Controller, Get, Query } from '@nestjs/common';
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
}
