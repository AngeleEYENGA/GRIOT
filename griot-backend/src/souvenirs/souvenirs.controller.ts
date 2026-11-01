import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateSouvenirDto } from './dto/create-souvenir.dto';
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
}
