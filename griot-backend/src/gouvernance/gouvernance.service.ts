import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { CreatePreuveDto } from './dto/create-preuve.dto';
import { UpdateStatutPreuveDto } from './dto/update-statut-preuve.dto';

@Injectable()
export class GouvernanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getInstitution(arbreId: string) {
    return this.prisma.institution.findUnique({ where: { arbreId } });
  }

  async createInstitution(arbreId: string, dto: CreateInstitutionDto) {
    const nom = dto.nom.trim();
    if (!nom) {
      throw new BadRequestException('Le nom de l’institution est obligatoire.');
    }
    const existing = await this.prisma.institution.findUnique({ where: { arbreId } });
    if (existing) {
      throw new BadRequestException('Une institution est déjà associée à cet arbre.');
    }
    return this.prisma.institution.create({
      data: { arbreId, nom, type: dto.type },
    });
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
