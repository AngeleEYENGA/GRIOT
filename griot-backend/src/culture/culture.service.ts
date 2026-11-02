import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CarteDto, PublicationDto, PublicationQuery } from './culture.dto';

const auteur = { select: { id: true, nom: true, prenom: true } };
const carteSelect = { id: true, arbreId: true, auteurId: true, langue: true, nomLangue: true, type: true, expression: true, traduction: true, explication: true, source: true, validee: true, audioMime: true, dateCreation: true, auteur };
@Injectable()
export class CultureService {
  constructor(private readonly prisma: PrismaService) {}
  async publications(arbreId: string, query: PublicationQuery) {
    if (query.parentId) await this.publication(arbreId, query.parentId);
    if (query.cursor) {
      const cursor = await this.publication(arbreId, query.cursor);
      if (cursor.parentId !== (query.parentId || null)) throw new BadRequestException('Curseur incompatible.');
    }
    const items = await this.prisma.publicationFamille.findMany({ where: { arbreId, parentId: query.parentId || null }, orderBy: [{ dateCreation: 'desc' }, { id: 'desc' }], take: 31, ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}), include: { auteur, _count: { select: { reponses: true } } } });
    return { items: items.slice(0, 30), nextCursor: items.length > 30 ? items[29].id : null };
  }
  async publish(arbreId: string, auteurId: string, dto: PublicationDto) {
    const contenu = dto.contenu.trim();
    if (!contenu) throw new BadRequestException('Écrivez un message.');
    if (dto.parentId) {
      const parent = await this.publication(arbreId, dto.parentId);
      if (parent.parentId) throw new BadRequestException('Répondez au fil principal.');
    }
    return this.prisma.publicationFamille.create({ data: { arbreId, auteurId, ...dto, contenu }, include: { auteur, _count: { select: { reponses: true } } } });
  }
  async removePublication(arbreId: string, id: string, userId: string, role: string) {
    const post = await this.publication(arbreId, id);
    this.canManage(post.auteurId, userId, role);
    await this.prisma.publicationFamille.delete({ where: { id } }); return { supprime: true };
  }
  cartes(arbreId: string) { return this.prisma.carteLangue.findMany({ where: { arbreId }, select: carteSelect, orderBy: { dateCreation: 'asc' }, take: 1000 }); }
  async createCarte(arbreId: string, auteurId: string, dto: CarteDto) {
    for (const key of ['nomLangue', 'expression', 'traduction', 'source']) if (!dto[key].trim()) throw new BadRequestException('Complétez les champs de la fiche.');
    return this.prisma.carteLangue.create({ data: { arbreId, auteurId, ...dto }, select: carteSelect });
  }
  async validateCarte(arbreId: string, id: string, validee: boolean) {
    await this.carte(arbreId, id);
    return this.prisma.carteLangue.update({ where: { id }, data: { validee }, select: carteSelect });
  }
  async removeCarte(arbreId: string, id: string, userId: string, role: string) {
    const card = await this.carte(arbreId, id); this.canManage(card.auteurId, userId, role);
    await this.prisma.carteLangue.delete({ where: { id } }); return { supprime: true };
  }
  async saveAudio(arbreId: string, id: string, userId: string, role: string, file: { buffer: Buffer; mimetype: string }) {
    const card = await this.carte(arbreId, id); this.canManage(card.auteurId, userId, role);
    const b = file?.buffer;
    if (!b || b.length > 512 * 1024) throw new BadRequestException('Audio limité à 512 Kio.');
    // Check signatures, never serve user-supplied HTML as a recording.
    const signature = b.subarray(0, 12).toString('hex');
    const mime = signature.startsWith('1a45dfa3') ? 'audio/webm' : b.subarray(0, 4).toString() === 'OggS' ? 'audio/ogg' : b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WAVE' ? 'audio/wav' : b.subarray(0, 3).toString() === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) ? 'audio/mpeg' : b.subarray(4, 8).toString() === 'ftyp' ? 'audio/mp4' : null;
    if (!mime || !file.mimetype.startsWith('audio/')) throw new BadRequestException('Enregistrement audio MP3, M4A, OGG, WAV ou WebM attendu.');
    return this.prisma.carteLangue.update({ where: { id }, data: { audio: b, audioMime: mime, validee: false }, select: carteSelect });
  }
  async audio(arbreId: string, id: string) {
    const card = await this.prisma.carteLangue.findFirst({ where: { id, arbreId }, select: { audio: true, audioMime: true } });
    if (!card?.audio || !card.audioMime) throw new NotFoundException('Prononciation non enregistrée.');
    return card;
  }
  private async publication(arbreId: string, id: string) {
    const post = await this.prisma.publicationFamille.findFirst({ where: { arbreId, id } });
    if (!post) throw new NotFoundException('Message introuvable sur cet arbre.'); return post;
  }
  private async carte(arbreId: string, id: string) {
    const card = await this.prisma.carteLangue.findFirst({ where: { arbreId, id }, select: { id: true, auteurId: true } });
    if (!card) throw new NotFoundException('Fiche introuvable sur cet arbre.'); return card;
  }
  private canManage(author: string, user: string, role: string) {
    if (author !== user && !['admin', 'editeur'].includes(role)) throw new ForbiddenException('Seul l’auteur ou un responsable peut retirer ce contenu.');
  }
}
