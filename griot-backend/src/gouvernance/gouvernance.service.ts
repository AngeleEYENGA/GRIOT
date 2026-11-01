import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { CreatePreuveDto } from './dto/create-preuve.dto';
import { UpdateStatutPreuveDto } from './dto/update-statut-preuve.dto';
import { InviteInstitutionMembreDto } from './dto/invite-institution-membre.dto';

@Injectable()
export class GouvernanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getInstitution(arbreId: string) {
    return this.prisma.institution.findUnique({ where: { arbreId } });
  }

  async createInstitution(arbreId: string, utilisateurId: string, dto: CreateInstitutionDto) {
    const nom = dto.nom.trim();
    if (!nom) {
      throw new BadRequestException('Le nom de l’institution est obligatoire.');
    }
    const existing = await this.prisma.institution.findUnique({ where: { arbreId } });
    if (existing) {
      throw new BadRequestException('Une institution est déjà associée à cet arbre.');
    }
    return this.prisma.$transaction(async (transaction) => {
      const institution = await transaction.institution.create({
        data: { arbreId, nom, type: dto.type },
      });
      await transaction.membreInstitution.create({
        data: {
          institutionId: institution.id,
          utilisateurId,
          role: 'administrateur',
          statut: 'actif',
        },
      });
      return institution;
    });
  }

  async inviteInstitutionMember(arbreId: string, dto: InviteInstitutionMembreDto) {
    const institution = await this.prisma.institution.findUnique({
      where: { arbreId },
      include: { arbre: { select: { nom: true } } },
    });
    if (!institution) throw new NotFoundException('Aucune institution n’est associée à cet arbre.');

    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: { email: { equals: dto.email.trim(), mode: 'insensitive' } },
      select: { id: true },
    });
    if (!utilisateur) {
      throw new NotFoundException('Aucun compte GRIOT ne correspond à cet email.');
    }

    const existing = await this.prisma.membreInstitution.findUnique({
      where: {
        institutionId_utilisateurId: {
          institutionId: institution.id,
          utilisateurId: utilisateur.id,
        },
      },
    });
    if (existing) throw new BadRequestException('Cette personne est déjà associée à l’institution.');

    return this.prisma.$transaction(async (transaction) => {
      const membre = await transaction.membreInstitution.create({
        data: {
          institutionId: institution.id,
          utilisateurId: utilisateur.id,
          role: dto.role ?? 'lecteur',
          statut: 'invite',
        },
        include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
      });
      await transaction.notification.create({
        data: {
          utilisateurId: utilisateur.id,
          type: 'invitation_institution',
          contenu: `Vous avez reçu une invitation à rejoindre l’espace de ${institution.nom}.`,
          cibleType: 'membre_institution',
          cibleId: membre.id,
          institutionId: institution.id,
        },
      });
      return membre;
    });
  }

  async getInstitutionSpace(utilisateurId: string) {
    const memberships = await this.prisma.membreInstitution.findMany({
      where: { utilisateurId },
      include: {
        institution: {
          include: { arbre: { select: { id: true, nom: true, dateCreation: true } } },
        },
      },
      orderBy: { dateInvitation: 'desc' },
    });
    const activeMemberships = memberships.filter((membership) => membership.statut === 'actif');
    const arbreIds = [...new Set(activeMemberships.map((membership) => membership.institution.arbre.id))];
    if (!arbreIds.length) {
      return {
        institutions: memberships.map((membership) => ({
          id: membership.institution.id,
          nom: membership.institution.nom,
          type: membership.institution.type,
          arbreId: membership.institution.arbre.id,
          arbreNom: membership.institution.arbre.nom,
          membreId: membership.id,
          role: membership.role,
          statut: membership.statut,
        })),
        statistiques: { population: 0, villages: 0, documents: 0, arbresSuivis: 0, preuvesEnAttente: 0 },
        preuvesEnAttente: [],
      };
    }

    const arbreScope = { in: arbreIds };
    const [population, villages, documents, preuvesEnAttente] = await Promise.all([
      this.prisma.personne.count({ where: { arbreId: arbreScope } }),
      this.prisma.personne.findMany({
        where: { arbreId: arbreScope, villageOrigine: { not: null } },
        select: { villageOrigine: true },
        distinct: ['villageOrigine'],
      }),
      this.prisma.media.count({
        where: {
          type: 'document',
          OR: [
            { personne: { arbreId: arbreScope } },
            { souvenir: { arbreId: arbreScope } },
          ],
        },
      }),
      this.prisma.preuve.findMany({
        where: {
          statutValidation: 'en_attente',
          OR: [
            { personne: { arbreId: arbreScope } },
            { souvenir: { arbreId: arbreScope } },
          ],
        },
        include: {
          personne: { select: { id: true, nom: true, prenom: true, arbre: { select: { id: true, nom: true } } } },
          souvenir: { select: { id: true, titre: true, arbre: { select: { id: true, nom: true } } } },
          auteur: { select: { id: true, nom: true, prenom: true } },
        },
        orderBy: { datePreuve: 'desc' },
        take: 100,
      }),
    ]);

    return {
      institutions: memberships.map((membership) => ({
        id: membership.institution.id,
        nom: membership.institution.nom,
        type: membership.institution.type,
        arbreId: membership.institution.arbre.id,
        arbreNom: membership.institution.arbre.nom,
        membreId: membership.id,
        role: membership.role,
        statut: membership.statut,
      })),
      statistiques: {
        population,
        villages: villages.length,
        documents,
        arbresSuivis: arbreIds.length,
        preuvesEnAttente: preuvesEnAttente.length,
      },
      preuvesEnAttente,
    };
  }

  async acceptInstitutionInvitation(
    utilisateurId: string,
    institutionId: string,
    membreId: string,
  ) {
    const membership = await this.prisma.membreInstitution.findFirst({
      where: { id: membreId, institutionId, utilisateurId },
    });
    if (!membership) throw new NotFoundException('Invitation institutionnelle introuvable.');
    if (membership.statut === 'actif') return membership;
    return this.prisma.membreInstitution.update({
      where: { id: membership.id },
      data: { statut: 'actif' },
    });
  }

  async getInstitutionProofs(utilisateurId: string, institutionId: string) {
    const membership = await this.requireInstitutionMembership(utilisateurId, institutionId);
    return this.prisma.preuve.findMany({
      where: {
        OR: [
          { personne: { arbreId: membership.institution.arbreId } },
          { souvenir: { arbreId: membership.institution.arbreId } },
        ],
      },
      include: {
        personne: { select: { id: true, nom: true, prenom: true } },
        souvenir: { select: { id: true, titre: true } },
        auteur: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { datePreuve: 'desc' },
    });
  }

  async reviewInstitutionProof(
    utilisateurId: string,
    institutionId: string,
    preuveId: string,
    dto: UpdateStatutPreuveDto,
  ) {
    const membership = await this.requireInstitutionMembership(utilisateurId, institutionId);
    if (!['administrateur', 'validateur'].includes(membership.role)) {
      throw new ForbiddenException('Votre rôle institutionnel ne permet pas de valider des preuves.');
    }
    const preuve = await this.prisma.preuve.findFirst({
      where: {
        id: preuveId,
        OR: [
          { personne: { arbreId: membership.institution.arbreId } },
          { souvenir: { arbreId: membership.institution.arbreId } },
        ],
      },
      select: { id: true, auteurId: true, personneId: true, souvenirId: true },
    });
    if (!preuve) throw new NotFoundException('Preuve introuvable dans cet espace institutionnel.');

    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.preuve.update({
        where: { id: preuve.id },
        data: { statutValidation: dto.statutValidation },
      });
      if (dto.statutValidation === 'validee') {
        if (preuve.personneId) {
          await transaction.personne.update({
            where: { id: preuve.personneId },
            data: { statutVerification: 'verifie_chefferie' },
          });
        }
        if (preuve.souvenirId) {
          await transaction.souvenir.update({
            where: { id: preuve.souvenirId },
            data: { statutVerification: 'verifie_chefferie' },
          });
        }
      }
      await transaction.notification.create({
        data: {
          utilisateurId: preuve.auteurId,
          type: 'preuve_institution',
          contenu: dto.statutValidation === 'validee'
            ? `Une preuve a été validée par ${membership.institution.nom}.`
            : `Une preuve a été rejetée par ${membership.institution.nom}.`,
          institutionId,
        },
      });
      return updated;
    });
  }

  private async requireInstitutionMembership(utilisateurId: string, institutionId: string) {
    const membership = await this.prisma.membreInstitution.findUnique({
      where: { institutionId_utilisateurId: { institutionId, utilisateurId } },
      include: { institution: { select: { arbreId: true, nom: true } } },
    });
    if (!membership || membership.statut !== 'actif') {
      throw new ForbiddenException('Vous n’avez pas accès à cet espace institutionnel.');
    }
    return membership;
  }

  async listPreuves(arbreId: string) {
    return this.prisma.preuve.findMany({
      where: {
        OR: [
          { personne: { arbreId } },
          { souvenir: { arbreId } },
        ],
      },
      include: {
        personne: { select: { id: true, nom: true, prenom: true } },
        souvenir: { select: { id: true, titre: true } },
        auteur: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { datePreuve: 'desc' },
    });
  }

  async createPreuve(arbreId: string, auteurId: string, dto: CreatePreuveDto) {
    if (!dto.personneId && !dto.souvenirId) {
      throw new BadRequestException('Associez la preuve à une personne ou à un souvenir.');
    }

    if (dto.personneId) {
      const personne = await this.prisma.personne.findFirst({
        where: { id: dto.personneId, arbreId },
        select: { id: true },
      });
      if (!personne) throw new NotFoundException('Personne introuvable dans cet arbre.');
    }
    if (dto.souvenirId) {
      const souvenir = await this.prisma.souvenir.findFirst({
        where: { id: dto.souvenirId, arbreId },
        select: { id: true },
      });
      if (!souvenir) throw new NotFoundException('Souvenir introuvable dans cet arbre.');
    }

    return this.prisma.preuve.create({
      data: {
        personneId: dto.personneId,
        souvenirId: dto.souvenirId,
        auteurId,
        type: dto.type.trim(),
        urlDocument: dto.urlDocument?.trim(),
        datePreuve: dto.datePreuve ? new Date(dto.datePreuve) : undefined,
      },
      include: {
        personne: { select: { id: true, nom: true, prenom: true } },
        souvenir: { select: { id: true, titre: true } },
        auteur: { select: { id: true, nom: true, prenom: true } },
      },
    });
  }

  async updatePreuve(arbreId: string, preuveId: string, dto: UpdateStatutPreuveDto) {
    const preuve = await this.prisma.preuve.findFirst({
      where: {
        id: preuveId,
        OR: [
          { personne: { arbreId } },
          { souvenir: { arbreId } },
        ],
      },
      select: { id: true, personneId: true, souvenirId: true },
    });
    if (!preuve) throw new NotFoundException('Preuve introuvable dans cet arbre.');

    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.preuve.update({
        where: { id: preuve.id },
        data: { statutValidation: dto.statutValidation },
      });

      if (dto.statutValidation === 'validee') {
        if (preuve.personneId) {
          await transaction.personne.update({
            where: { id: preuve.personneId },
            data: { statutVerification: 'verifie_famille' },
          });
        }
        if (preuve.souvenirId) {
          await transaction.souvenir.update({
            where: { id: preuve.souvenirId },
            data: { statutVerification: 'verifie_famille' },
          });
        }
      }

      return updated;
    });
  }
}
