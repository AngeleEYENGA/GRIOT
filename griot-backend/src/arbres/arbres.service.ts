import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArbreDto } from './dto/create-arbre.dto';

@Injectable()
export class ArbresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Créer un arbre crée aussi, dans la même transaction, le MembreArbre
   * "admin" pour le créateur — cf. §7 du dossier de conception : chaque
   * arbre doit toujours avoir au moins un administrateur actif.
   */
  async create(utilisateurId: string, dto: CreateArbreDto) {
    return this.prisma.$transaction(async (tx) => {
      const arbre = await tx.arbre.create({
        data: {
          nom: dto.nom,
          visibilite: dto.visibilite ?? 'prive',
          proprietaireId: utilisateurId,
        },
      });

      await tx.membreArbre.create({
        data: {
          utilisateurId,
          arbreId: arbre.id,
          role: 'admin',
          statut: 'actif',
        },
      });

      return arbre;
    });
  }

  async findAllForUser(utilisateurId: string) {
    return this.prisma.arbre.findMany({
      where: { membres: { some: { utilisateurId, statut: 'actif' } } },
      include: { membres: true },
    });
  }

  async findOne(id: string, utilisateurId: string) {
    const membre = await this.prisma.membreArbre.findFirst({
      where: { arbreId: id, utilisateurId, statut: 'actif' },
    });
    if (!membre) {
      throw new ForbiddenException("Vous n'avez pas accès à cet arbre.");
    }

    const arbre = await this.prisma.arbre.findUnique({
      where: { id },
      include: { membres: true, identiteFamiliale: true },
    });
    if (!arbre) {
      throw new NotFoundException('Arbre introuvable.');
    }
    return arbre;
  }
}
