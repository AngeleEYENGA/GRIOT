import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { CreatePreuveDto } from './dto/create-preuve.dto';
import { GouvernanceService } from './gouvernance.service';
import { UpdateStatutPreuveDto } from './dto/update-statut-preuve.dto';
import { InviteInstitutionMembreDto } from './dto/invite-institution-membre.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('gouvernance familiale')
@ApiBearerAuth()
@Controller('arbres/:arbreId')
export class GouvernanceController {
  constructor(private readonly gouvernanceService: GouvernanceService) {}

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get('institution')
  getInstitution(@Param('arbreId') arbreId: string) {
    return this.gouvernanceService.getInstitution(arbreId);
  }

  @Roles('admin')
  @Post('institution')
  createInstitution(@Param('arbreId') arbreId: string, @Req() req, @Body() dto: CreateInstitutionDto) {
    return this.gouvernanceService.createInstitution(arbreId, req.user.id, dto);
  }

  @Roles('admin')
  @Post('institution/membres')
  inviteInstitutionMember(
    @Param('arbreId') arbreId: string,
    @Body() dto: InviteInstitutionMembreDto,
  ) {
    return this.gouvernanceService.inviteInstitutionMember(arbreId, dto);
  }

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get('preuves')
  listPreuves(@Param('arbreId') arbreId: string) {
    return this.gouvernanceService.listPreuves(arbreId);
  }

  @Roles('admin', 'editeur', 'contributeur')
  @Post('preuves')
  createPreuve(@Param('arbreId') arbreId: string, @Req() req, @Body() dto: CreatePreuveDto) {
    return this.gouvernanceService.createPreuve(arbreId, req.user.id, dto);
  }

  @Roles('admin', 'editeur')
  @Patch('preuves/:preuveId')
  updatePreuve(
    @Param('arbreId') arbreId: string,
    @Param('preuveId') preuveId: string,
    @Body() dto: UpdateStatutPreuveDto,
  ) {
    return this.gouvernanceService.updatePreuve(arbreId, preuveId, dto);
  }
}
