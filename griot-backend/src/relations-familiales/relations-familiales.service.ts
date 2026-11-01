import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { UpdateRelationDto } from './dto/update-relation.dto';

@Injectable()
export class RelationsFamilialesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(arbreId: string) {
    return this.prisma.relationFamiliale.findMany({
      where: { personne1: { arbreId } },
      include: { personne1: true, personne2: true },
    });
  }

  async create(arbreId: string, dto: CreateRelationDto) {
    await this.assertPeopleBelongToTree(arbreId, dto.personneId1, dto.personneId2);
    const precision = this.getPrecision(dto);

    return this.prisma.relationFamiliale.create({
      data: {
        personneId1: dto.personneId1,
        personneId2: dto.personneId2,
        typeRelation: dto.typeRelation,
        precision,
      },
      include: { personne1: true, personne2: true },
    });
  }

  async update(arbreId: string, id: string, dto: UpdateRelationDto) {
    const relation = await this.prisma.relationFamiliale.findFirst({
      where: { id, personne1: { arbreId } },
    });
    if (!relation) {
      throw new NotFoundException('Relation introuvable sur cet arbre.');
    }

    await this.assertPeopleBelongToTree(arbreId, dto.personneId1, dto.personneId2);
    const precision = this.getPrecision(dto);

    return this.prisma.relationFamiliale.update({
      where: { id },
      data: {
        personneId1: dto.personneId1,
        personneId2: dto.personneId2,
        typeRelation: dto.typeRelation,
        precision,
      },
      include: { personne1: true, personne2: true },
    });
  }

  async remove(arbreId: string, id: string) {
    const relation = await this.prisma.relationFamiliale.findFirst({
      where: { id, personne1: { arbreId } },
    });
    if (!relation) {
      throw new NotFoundException('Relation introuvable sur cet arbre.');
    }
    await this.prisma.relationFamiliale.delete({ where: { id } });
    return { supprime: true };
  }

  private async assertPeopleBelongToTree(arbreId: string, personneId1: string, personneId2: string) {
    if (personneId1 === personneId2) {
      throw new BadRequestException('Une personne ne peut pas être liée à elle-même.');
    }

    const [p1, p2] = await Promise.all([
      this.prisma.personne.findFirst({ where: { id: personneId1, arbreId } }),
      this.prisma.personne.findFirst({ where: { id: personneId2, arbreId } }),
    ]);
    if (!p1 || !p2) {
      throw new BadRequestException('Les deux personnes doivent appartenir à cet arbre.');
    }
  }

  private getPrecision(dto: CreateRelationDto) {
    const precision = dto.precision?.trim();
    if (dto.typeRelation === 'autre' && !precision) {
      throw new BadRequestException('Précisez le lien familial personnalisé.');
    }
    return dto.typeRelation === 'autre' ? precision : null;
  }
}
