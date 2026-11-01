import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleArbre } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSouvenirDto } from './dto/create-souvenir.dto';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';

@Injectable()
export class SouvenirsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(arbreId: string) {
    return this.prisma.souvenir.findMany({
      where: { arbreId },
      include: {
        auteur: { select: { nom: true, prenom: true } },
        personne: { select: { nom: true, prenom: true } },
        medias: { select: { id: true, type: true, tailleOctets: true, dateUpload: true } },
        _count: { select: { commentaires: true } },
      },
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

  async listComments(arbreId: string, souvenirId: string) {
    await this.findSouvenir(arbreId, souvenirId);
    return this.prisma.commentaireSouvenir.findMany({
      where: { souvenirId },
      include: { auteur: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { dateCreation: 'asc' },
    });
  }

  async createComment(
    arbreId: string,
    souvenirId: string,
    auteurId: string,
    dto: CreateCommentaireDto,
  ) {
    const souvenir = await this.findSouvenir(arbreId, souvenirId);
    const contenu = dto.contenu.trim();
    if (!contenu) throw new BadRequestException('Le commentaire ne peut pas être vide.');

    return this.prisma.$transaction(async (transaction) => {
      const commentaire = await transaction.commentaireSouvenir.create({
        data: { souvenirId, auteurId, contenu },
        include: { auteur: { select: { id: true, nom: true, prenom: true } } },
      });

      if (souvenir.auteurId !== auteurId) {
        await transaction.notification.create({
          data: {
            utilisateurId: souvenir.auteurId,
            type: 'commentaire_souvenir',
            contenu: `Un membre a commenté votre souvenir « ${souvenir.titre} ».`,
          },
        });
      }
      return commentaire;
    });
  }

  async removeComment(
    arbreId: string,
    souvenirId: string,
    commentId: string,
    utilisateurId: string,
    role: RoleArbre,
  ) {
    await this.findSouvenir(arbreId, souvenirId);
    const commentaire = await this.prisma.commentaireSouvenir.findFirst({
      where: { id: commentId, souvenirId },
      select: { id: true, auteurId: true },
    });
    if (!commentaire) throw new NotFoundException('Commentaire introuvable.');
    if (commentaire.auteurId !== utilisateurId && !['admin', 'editeur'].includes(role)) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres commentaires.');
    }
    await this.prisma.commentaireSouvenir.delete({ where: { id: commentId } });
    return { supprime: true };
  }

  private async findSouvenir(arbreId: string, souvenirId: string) {
    const souvenir = await this.prisma.souvenir.findFirst({
      where: { id: souvenirId, arbreId },
      select: { id: true, auteurId: true, titre: true },
    });
    if (!souvenir) throw new NotFoundException('Souvenir introuvable sur cet arbre.');
    return souvenir;
  }
}
