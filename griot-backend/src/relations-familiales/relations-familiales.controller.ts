import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RelationsFamilialesService } from './relations-familiales.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('relations-familiales')
@ApiBearerAuth()
@Controller('arbres/:arbreId/relations')
export class RelationsFamilialesController {
  constructor(private readonly relationsService: RelationsFamilialesService) {}

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get()
  findAll(@Param('arbreId') arbreId: string) {
    return this.relationsService.findAll(arbreId);
  }

  @Roles('admin', 'editeur')
  @Post()
  create(@Param('arbreId') arbreId: string, @Body() dto: CreateRelationDto) {
    return this.relationsService.create(arbreId, dto);
  }

  @Roles('admin', 'editeur')
  @Patch(':id')
  update(@Param('arbreId') arbreId: string, @Param('id') id: string, @Body() dto: UpdateRelationDto) {
    return this.relationsService.update(arbreId, id, dto);
  }

  @Roles('admin', 'editeur')
  @Delete(':id')
  remove(@Param('arbreId') arbreId: string, @Param('id') id: string) {
    return this.relationsService.remove(arbreId, id);
  }
}
