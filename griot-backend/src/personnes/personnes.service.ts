import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleArbre } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonneDto } from './dto/create-personne.dto';
import { UpdatePersonneDto } from './dto/update-personne.dto';

@Injectable()
export class PersonnesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(arbreId: string) {
    return this.prisma.personne.findMany({ where: { arbreId } });
  }

  async findOne(arbreId: string, id: string) {
    const personne = await this.prisma.personne.findFirst({ where: { id, arbreId } });
    if (!personne) {
      throw new NotFoundException('Personne introuvable sur cet arbre.');
    }
    return personne;
  }

  /**
   * Un Contributeur crée un enregistrement non vérifié (proposition) ;
   * un Éditeur/Administrateur crée directement un enregistrement à jour.
   * Cf. §7 du dossier de conception : "une contribution d'un Contributeur
   * crée un enregistrement en attente, visible publiquement qu'après
   * validation par un Éditeur ou un Administrateur".
   */
  async create(arbreId: string, roleAuteur: RoleArbre, dto: CreatePersonneDto) {
    const statutVerification = roleAuteur === 'contributeur' ? 'non_verifie' : 'verifie_famille';

    return this.prisma.personne.create({
      data: {
        arbreId,
        nom: dto.nom,
        prenom: dto.prenom,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateDeces: dto.dateDeces ? new Date(dto.dateDeces) : undefined,
        villageOrigine: dto.villageOrigine,
        biographie: dto.biographie,
        statutVerification,
      },
    });
  }

  async update(arbreId: string, id: string, dto: UpdatePersonneDto) {
    await this.findOne(arbreId, id);
    return this.prisma.personne.update({
      where: { id },
      data: {
        ...dto,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        dateDeces: dto.dateDeces ? new Date(dto.dateDeces) : undefined,
      },
    });
  }

  /**
   * Valider une proposition faite par un Contributeur — réservé aux
   * Éditeurs/Administrateurs (contrôlé au niveau du contrôleur via @Roles).
   */
  async valider(arbreId: string, id: string) {
    await this.findOne(arbreId, id);
    return this.prisma.personne.update({
      where: { id },
      data: { statutVerification: 'verifie_famille' },
    });
  }

  async remove(arbreId: string, id: string) {
    await this.findOne(arbreId, id);
    await this.prisma.personne.delete({ where: { id } });
    return { supprime: true };
  }
}
