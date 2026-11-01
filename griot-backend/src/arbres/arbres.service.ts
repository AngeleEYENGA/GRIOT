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

  async getDashboard(id: string, utilisateurId: string) {
    await this.findOne(id, utilisateurId);

    const [
      nombrePersonnes,
      nombreRelations,
      nombreSouvenirs,
      nombreMembres,
      nombreBiographies,
    ] = await Promise.all([
      this.prisma.personne.count({ where: { arbreId: id } }),
      this.prisma.relationFamiliale.count({ where: { personne1: { arbreId: id } } }),
      this.prisma.souvenir.count({ where: { arbreId: id } }),
      this.prisma.membreArbre.count({ where: { arbreId: id, statut: 'actif' } }),
      this.prisma.personne.count({
        where: { arbreId: id, biographie: { not: '' } },
      }),
    ]);

    const missions = [
      {
        id: 'ajouter-personnes',
        libelle: 'Présenter deux membres de la famille',
        description: 'Ajoutez au moins deux personnes pour commencer votre arbre.',
        progression: Math.min(nombrePersonnes, 2),
        objectif: 2,
        terminee: nombrePersonnes >= 2,
        onglet: 'personnes',
      },
      {
        id: 'relier-personnes',
        libelle: 'Créer un premier lien familial',
        description: 'Reliez deux personnes pour faire apparaître la généalogie.',
        progression: Math.min(nombreRelations, 1),
        objectif: 1,
        terminee: nombreRelations > 0,
        onglet: 'relations',
      },
      {
        id: 'partager-souvenir',
        libelle: 'Enregistrer un souvenir',
        description: 'Conservez une histoire, une recette ou une tradition.',
        progression: Math.min(nombreSouvenirs, 1),
        objectif: 1,
        terminee: nombreSouvenirs > 0,
        onglet: 'souvenirs',
      },
      {
        id: 'documenter-biographie',
        libelle: 'Écrire une biographie',
        description: 'Ajoutez quelques lignes sur la vie d’un proche.',
        progression: Math.min(nombreBiographies, 1),
        objectif: 1,
        terminee: nombreBiographies > 0,
        onglet: 'personnes',
      },
      {
        id: 'inviter-proche',
        libelle: 'Inviter un proche à contribuer',
        description: 'Construisez l’arbre ensemble en invitant un membre.',
        progression: Math.min(Math.max(nombreMembres - 1, 0), 1),
        objectif: 1,
        terminee: nombreMembres > 1,
        onglet: 'membres',
      },
    ];
    const missionsTerminees = missions.filter((mission) => mission.terminee).length;

    return {
      statistiques: {
        personnes: nombrePersonnes,
        relations: nombreRelations,
        souvenirs: nombreSouvenirs,
        membres: nombreMembres,
      },
      completude: {
        missionsTerminees,
        totalMissions: missions.length,
        pourcentage: Math.round((missionsTerminees / missions.length) * 100),
      },
      missions,
    };
  }
}
