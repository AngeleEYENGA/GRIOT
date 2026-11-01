import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleArbre } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSouvenirDto } from './dto/create-souvenir.dto';

@Injectable()
export class SouvenirsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(arbreId: string) {
    return this.prisma.souvenir.findMany({
      where: { arbreId },
      include: { auteur: { select: { nom: true, prenom: true } }, personne: { select: { nom: true, prenom: true } } },
      orderBy: { dateCreation: 'desc' },
    });
  }

  async create(arbreId: string, auteurId: string, role: RoleArbre, dto: CreateSouvenirDto) {
    if (dto.personneId) {
      const personne = await this.prisma.personne.findFirst({ where: { id: dto.personneId, arbreId } });
      if (!personne) throw new NotFoundException('La personne sélectionnée est introuvable sur cet arbre.');
    }
    return this.prisma.souvenir.create({
      data: {
        arbreId, auteurId, personneId: dto.personneId, categorie: dto.categorie,
        titre: dto.titre, contenu: dto.contenu,
        statutVerification: role === 'contributeur' ? 'non_verifie' : 'verifie_famille',
      },
      include: { auteur: { select: { nom: true, prenom: true } }, personne: { select: { nom: true, prenom: true } } },
    });
  }

  async remove(arbreId: string, id: string) {
    const souvenir = await this.prisma.souvenir.findFirst({ where: { id, arbreId } });
    if (!souvenir) throw new NotFoundException('Souvenir introuvable sur cet arbre.');
    await this.prisma.souvenir.delete({ where: { id } });
    return { supprime: true };
  }
}
