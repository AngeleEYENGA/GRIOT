import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteMembreDto } from './dto/invite-membre.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class MembresArbreService {
  constructor(private readonly prisma: PrismaService) {}

  async list(arbreId: string) {
    return this.prisma.membreArbre.findMany({
      where: { arbreId },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
    });
  }

  /**
   * Invite un utilisateur existant sur l'arbre. Le cas "l'email ne
   * correspond à aucun compte" (invitation d'une personne qui n'a pas
   * encore de compte GRIOT) relève du domaine Identity & Trust — pas
   * encore construit en V1 (cf. §14 du dossier de conception) : ici on
   * suppose que l'utilisateur a déjà un compte.
   */
  async invite(arbreId: string, dto: InviteMembreDto) {
    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: { email: { equals: dto.email.trim(), mode: 'insensitive' } },
    });
    if (!utilisateur) {
      throw new NotFoundException(
        "Aucun compte GRIOT trouvé pour cet email. L'invitation d'un compte inexistant n'est pas encore prise en charge.",
      );
    }

    const dejaMembre = await this.prisma.membreArbre.findUnique({
      where: { utilisateurId_arbreId: { utilisateurId: utilisateur.id, arbreId } },
    });
    if (dejaMembre) {
      throw new BadRequestException('Cette personne est déjà membre de cet arbre.');
    }

    return this.prisma.membreArbre.create({
      data: {
        utilisateurId: utilisateur.id,
        arbreId,
        role: dto.role,
        statut: 'invite',
      },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
    });
  }

  async updateRole(arbreId: string, membreId: string, acteurId: string, dto: UpdateRoleDto) {
    const membre = await this.prisma.membreArbre.findUnique({ where: { id: membreId } });
    if (!membre || membre.arbreId !== arbreId) {
      throw new NotFoundException('Membre introuvable sur cet arbre.');
    }
    if (membre.utilisateurId === acteurId && membre.role !== dto.role) {
      throw new BadRequestException('Vous ne pouvez pas modifier votre propre rôle.');
    }
    if (membre.role === 'admin' && membre.statut === 'actif' && dto.role !== 'admin') {
      const activeAdmins = await this.prisma.membreArbre.count({
        where: { arbreId, role: 'admin', statut: 'actif' },
      });
      if (activeAdmins <= 1) {
        throw new BadRequestException("L'arbre doit conserver au moins un administrateur actif.");
      }
    }
    return this.prisma.membreArbre.update({ where: { id: membreId }, data: { role: dto.role } });
  }

  async acceptInvitation(utilisateurId: string, membreId: string) {
    const membre = await this.prisma.membreArbre.findUnique({ where: { id: membreId } });
    if (!membre || membre.utilisateurId !== utilisateurId) {
      throw new NotFoundException('Invitation introuvable.');
    }
    return this.prisma.membreArbre.update({ where: { id: membreId }, data: { statut: 'actif' } });
  }
}
