import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembresArbreService } from './membres-arbre.service';
import { InviteMembreDto } from './dto/invite-membre.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('membres-arbre')
@ApiBearerAuth()
@Controller('arbres/:arbreId/membres')
export class MembresArbreController {
  constructor(private readonly membresArbreService: MembresArbreService) {}

  // Lecture ouverte à tous les membres actifs de l'arbre
  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get()
  list(@Param('arbreId') arbreId: string) {
    return this.membresArbreService.list(arbreId);
  }

  // Inviter / changer un rôle : réservé aux administrateurs (§7 du dossier de conception)
  @Roles('admin')
  @Post()
  invite(@Param('arbreId') arbreId: string, @Req() req, @Body() dto: InviteMembreDto) {
    return this.membresArbreService.invite(arbreId, dto, req.user.id);
  }

  @Roles('admin')
  @Patch(':membreId/role')
  updateRole(
    @Param('arbreId') arbreId: string,
    @Param('membreId') membreId: string,
    @Req() req,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.membresArbreService.updateRole(arbreId, membreId, req.user.id, dto);
  }

  @Post(':membreId/accepter')
  accepter(@Req() req, @Param('membreId') membreId: string) {
    return this.membresArbreService.acceptInvitation(req.user.id, membreId);
  }
}
