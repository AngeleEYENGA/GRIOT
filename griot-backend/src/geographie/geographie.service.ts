import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMigrationDto } from './dto/create-migration.dto';

@Injectable()
export class GeographieService {
  constructor(private readonly prisma: PrismaService) {}

  async list(arbreId: string) {
    return this.prisma.migration.findMany({
      where: { personne: { arbreId } },
      include: {
        personne: { select: { id: true, nom: true, prenom: true } },
        lieu: true,
      },
      orderBy: [{ ordre: 'asc' }, { dateEvenement: 'asc' }],
    });
  }

  async create(arbreId: string, dto: CreateMigrationDto) {
    const personne = await this.prisma.personne.findFirst({
      where: { id: dto.personneId, arbreId },
      select: { id: true },
    });
    if (!personne) {
      throw new NotFoundException('Cette personne ne fait pas partie de cet arbre.');
    }

    if ((dto.latitude === undefined) !== (dto.longitude === undefined)) {
      throw new BadRequestException('La latitude et la longitude doivent être fournies ensemble.');
    }

    const nom = dto.lieu.trim();
    const pays = dto.pays?.trim() || null;
    if (!nom) {
      throw new BadRequestException('Le nom du lieu est obligatoire.');
    }

    const existing = await this.prisma.lieu.findFirst({
      where: {
        nom: { equals: nom, mode: 'insensitive' },
        pays: pays ? { equals: pays, mode: 'insensitive' } : null,
      },
    });
    const lieu = existing ?? await this.prisma.lieu.create({
      data: {
        nom,
        pays,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return this.prisma.migration.create({
      data: {
        personneId: personne.id,
        lieuId: lieu.id,
        dateEvenement: dto.dateEvenement ? new Date(dto.dateEvenement) : undefined,
        ordre: dto.ordre,
      },
      include: {
        personne: { select: { id: true, nom: true, prenom: true } },
        lieu: true,
      },
    });
  }

  async remove(arbreId: string, migrationId: string) {
    const migration = await this.prisma.migration.findFirst({
      where: { id: migrationId, personne: { arbreId } },
      select: { id: true },
    });
    if (!migration) {
      throw new NotFoundException('Étape de migration introuvable.');
    }
    return this.prisma.migration.delete({ where: { id: migration.id } });
  }
}
