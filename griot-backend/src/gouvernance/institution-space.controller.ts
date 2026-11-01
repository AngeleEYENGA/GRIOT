import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateStatutPreuveDto } from './dto/update-statut-preuve.dto';
import { GouvernanceService } from './gouvernance.service';

@UseGuards(JwtAuthGuard)
@ApiTags('espace institutionnel')
@ApiBearerAuth()
@Controller('institutions')
export class InstitutionSpaceController {
  constructor(private readonly gouvernanceService: GouvernanceService) {}

  @Get('espace')
  getSpace(@Req() req) {
    return this.gouvernanceService.getInstitutionSpace(req.user.id);
  }

  @Post(':institutionId/membres/:memberId/accepter')
  acceptInvitation(
    @Req() req,
    @Param('institutionId') institutionId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.gouvernanceService.acceptInstitutionInvitation(
      req.user.id,
      institutionId,
      memberId,
    );
  }

  @Get(':institutionId/preuves')
  getProofs(@Req() req, @Param('institutionId') institutionId: string) {
    return this.gouvernanceService.getInstitutionProofs(req.user.id, institutionId);
  }

  @Patch(':institutionId/preuves/:preuveId')
  reviewProof(
    @Req() req,
    @Param('institutionId') institutionId: string,
    @Param('preuveId') preuveId: string,
    @Body() dto: UpdateStatutPreuveDto,
  ) {
    return this.gouvernanceService.reviewInstitutionProof(
      req.user.id,
      institutionId,
      preuveId,
      dto,
    );
  }
}
