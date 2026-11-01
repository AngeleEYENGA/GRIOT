import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMigrationDto } from './dto/create-migration.dto';
import { GeographieService } from './geographie.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('géographie')
@ApiBearerAuth()
@Controller('arbres/:arbreId/migrations')
export class GeographieController {
  constructor(private readonly geographieService: GeographieService) {}

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get()
  list(@Param('arbreId') arbreId: string) {
    return this.geographieService.list(arbreId);
  }

  @Roles('admin', 'editeur', 'contributeur')
  @Post()
  create(@Param('arbreId') arbreId: string, @Body() dto: CreateMigrationDto) {
    return this.geographieService.create(arbreId, dto);
  }

  @Roles('admin', 'editeur')
  @Delete(':migrationId')
  remove(@Param('arbreId') arbreId: string, @Param('migrationId') migrationId: string) {
    return this.geographieService.remove(arbreId, migrationId);
  }
}
