import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Prisma, Source } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ArchiveSourceDto, ConsultationDto, CreateSourceDto, SourceMetadataDto, SourceQuery, UpdateSourceDto } from './knowledge.dto';

const staffRoles = ['curateur', 'validateur', 'administrateur'] as const;
const trim = (value?: string) => value?.trim() || null;
const unique = (values?: string[]) => [...new Set((values || []).map((v) => v.trim()).filter(Boolean))];
@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  private async staff(userId: string, db = this.prisma as Prisma.TransactionClient) {
    return db.habilitationDocumentaire.findMany({ where: { utilisateurId: userId, active: true, utilisateur: { statut: 'actif' } }, select: { role: true } });
  }
  private async allowed(userId: string): Promise<Prisma.SourceWhereInput> {
    const roles = await this.staff(userId);
    return { OR: [
      { perimetre: 'arbre', arbre: { membres: { some: { utilisateurId: userId, statut: 'actif', utilisateur: { statut: 'actif' } } } } },
      { perimetre: 'editorial', ...(roles.some((r) => staffRoles.includes(r.role)) ? {} : { publie: true, statutDocumentaire: 'verifie' }) },
    ] };
  }
  private async source(id: string, userId: string) {
    const source = await this.prisma.source.findFirst({ where: { AND: [{ id }, await this.allowed(userId)] } });
    if (!source) throw new NotFoundException('Source introuvable ou inaccessible.');
    return source;
  }
  private async writable(source: Pick<Source, 'perimetre' | 'arbreId' | 'auteurId'>, userId: string, db = this.prisma as Prisma.TransactionClient) {
    if (source.perimetre === 'editorial') return (await this.staff(userId, db)).some((r) => ['curateur', 'administrateur'].includes(r.role));
    if (source.perimetre !== 'arbre' || !source.arbreId) return false;
    const member = await db.membreArbre.findFirst({ where: { arbreId: source.arbreId, utilisateurId: userId, statut: 'actif', utilisateur: { statut: 'actif' } }, select: { role: true } });
    return Boolean(member && (['admin', 'editeur'].includes(member.role) || member.role === 'contributeur' && source.auteurId === userId));
  }
  private async requireWrite(source: Pick<Source, 'perimetre' | 'arbreId' | 'auteurId'>, userId: string, db: Prisma.TransactionClient) {
    if (!await this.writable(source, userId, db)) throw new ForbiddenException('Votre rôle ne permet pas de modifier ce registre documentaire.');
  }
  private metadata(dto: SourceMetadataDto) {
    const nom = dto.nom.trim(); if (!nom) throw new BadRequestException('Le titre est obligatoire.');
    let url = trim(dto.url); let doi = trim(dto.doi);
    if (url) {
      try { const parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error(); url = parsed.href; }
      catch { throw new BadRequestException('Une URL HTTP(S) sans identifiants est attendue. Aucun téléchargement n’est effectué.'); }
    }
    if (doi) { doi = doi.replace(/^(https?:\/\/(dx\.)?doi\.org\/|doi:\s*)/i, '').toLowerCase(); if (!/^10\.\d{4,9}\/\S+$/.test(doi)) throw new BadRequestException('Le DOI indiqué n’est pas valide.'); }
    return { nom, type: dto.type ?? 'autre' as const, reference: trim(dto.reference), auteurs: unique(dto.auteurs), organisme: trim(dto.organisme), categorieDocument: dto.categorieDocument ?? 'autre', nature: dto.nature ?? 'indeterminee' as const, publication: trim(dto.publication), langueDocument: trim(dto.langueDocument), url, doi, territoires: unique(dto.territoires), periode: trim(dto.periode), themes: unique(dto.themes), licence: trim(dto.licence), droitsUsage: trim(dto.droitsUsage) };
  }
  private dedup(data: ReturnType<KnowledgeService['metadata']>, scope: string) {
    if (data.doi) return `${scope}:doi:${data.doi}`;
    if (!data.url) return null;
    const url = new URL(data.url); url.hash = '';
    return `${scope}:url:${createHash('sha256').update(url.href).digest('hex')}`;
  }
  private async version(db: Prisma.TransactionClient, source: Source, userId: string, motif: string, action: string) {
    // This digest identifies a metadata snapshot, never the contents of a remote document.
    const { id, arbreId, perimetre, cleDedup, auteurId, dateCreation, dateModification, ...metadata } = source;
    void arbreId; void perimetre; void cleDedup; void auteurId; void dateCreation; void dateModification;
    const metadonnees = JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue;
    await db.versionSource.create({ data: { sourceId: id, numero: source.revision, metadonnees, empreinteMetadonnees: createHash('sha256').update(JSON.stringify(metadonnees)).digest('hex'), acteurId: userId, motif } });
    await db.journalDocumentaire.create({ data: { sourceId: id, acteurId: userId, action, revision: source.revision, motif } });
  }
  private conflict(error: unknown): never {
    if ((error as { code?: string })?.code === 'P2002') throw new ConflictException('Cette référence existe déjà dans ce périmètre ou a été modifiée simultanément.');
    throw error;
  }

  async list(userId: string, query: SourceQuery) {
    const scope: Prisma.SourceWhereInput = query.arbreId ? { perimetre: 'arbre', arbreId: query.arbreId } : { perimetre: 'editorial' };
    const member = query.arbreId ? await this.prisma.membreArbre.findFirst({ where: { arbreId: query.arbreId, utilisateurId: userId, statut: 'actif' }, select: { role: true } }) : null;
    if (query.arbreId && !member) throw new NotFoundException('Registre introuvable ou inaccessible.');
    const where: Prisma.SourceWhereInput = { AND: [await this.allowed(userId), scope, { statutDocumentaire: query.statut ?? { not: 'archive' } }, ...(query.recherche?.trim() ? [{ OR: ['nom', 'organisme', 'reference', 'doi'].map((key) => ({ [key]: { contains: query.recherche!.trim(), mode: 'insensitive' } })) }] : [])] };
    if (query.cursor && !await this.prisma.source.findFirst({ where: { AND: [where, { id: query.cursor }] }, select: { id: true } })) throw new BadRequestException('Curseur incompatible avec ce registre.');
    const limit = query.limit ?? 25;
    const rows = await this.prisma.source.findMany({ where, orderBy: [{ dateCreation: 'desc' }, { id: 'desc' }], take: limit + 1, ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}) });
    const staff = await this.staff(userId);
    const items = rows.slice(0, limit).map((source) => {
      const { cleDedup, auteurId, ...item } = source; void cleDedup;
      const canEdit = source.perimetre === 'arbre' ? Boolean(member && (['admin', 'editeur'].includes(member.role) || member.role === 'contributeur' && auteurId === userId)) : staff.some((r) => ['curateur', 'administrateur'].includes(r.role));
      return { ...item, ...(source.perimetre === 'arbre' || staff.length ? { auteurId } : {}), canEdit };
    });
    return { items, nextCursor: rows.length > limit ? items.at(-1)!.id : null };
  }
  async detail(userId: string, id: string) {
    const source = await this.source(id, userId);
    if (source.perimetre === 'editorial' && !(await this.staff(userId)).length) {
      const { cleDedup, auteurId, ...item } = source; void cleDedup; void auteurId;
      return { ...item, canEdit: false, versions: [], consultations: [], journal: [], historyLimit: 0 };
    }
    const [versions, consultations, journal] = await Promise.all([
      this.prisma.versionSource.findMany({ where: { sourceId: id }, orderBy: { numero: 'desc' }, take: 50 }),
      this.prisma.consultationSource.findMany({ where: { sourceId: id }, orderBy: { dateEnregistrement: 'desc' }, take: 50 }),
      this.prisma.journalDocumentaire.findMany({ where: { sourceId: id }, orderBy: { dateCreation: 'desc' }, take: 50 }),
    ]);
    const { cleDedup, ...item } = source; void cleDedup;
    return { ...item, canEdit: await this.writable(source, userId), versions, consultations, journal, historyLimit: 50 };
  }
  async create(userId: string, dto: CreateSourceDto) {
    const data = this.metadata(dto); const scope = dto.arbreId ? `arbre:${dto.arbreId}` : 'editorial';
    try { return await this.prisma.$transaction(async (db) => {
      const context = { perimetre: dto.arbreId ? 'arbre' as const : 'editorial' as const, arbreId: dto.arbreId ?? null, auteurId: userId };
      await this.requireWrite(context, userId, db);
      const source = await db.source.create({ data: { ...data, ...context, cleDedup: this.dedup(data, scope) } });
      await this.version(db, source, userId, 'Référence identifiée ; document non consulté par GRIOT.', 'creation');
      return { id: source.id, revision: source.revision };
    }); } catch (e) { this.conflict(e); }
  }
  async update(userId: string, id: string, dto: UpdateSourceDto) {
    const old = await this.source(id, userId); const data = this.metadata(dto); const motif = dto.motif.trim();
    if (!motif) throw new BadRequestException('Expliquez la modification.');
    try { return await this.prisma.$transaction(async (db) => {
      await this.requireWrite(old, userId, db);
      const changed = await db.source.updateMany({ where: { id, revision: dto.revision, statutDocumentaire: { not: 'archive' } }, data: { ...data, revision: { increment: 1 }, cleDedup: this.dedup(data, old.arbreId ? `arbre:${old.arbreId}` : 'editorial'), statutDocumentaire: 'a_examiner', publie: false, dateModification: new Date() } });
      if (!changed.count) throw new ConflictException('La source a changé ou a été archivée. Actualisez-la avant de modifier.');
      const source = await db.source.findUniqueOrThrow({ where: { id } }); await this.version(db, source, userId, motif, 'modification');
      return { id, revision: source.revision };
    }); } catch (e) { this.conflict(e); }
  }
  async archive(userId: string, id: string, dto: ArchiveSourceDto) {
    const old = await this.source(id, userId); const motif = dto.motif.trim();
    if (!motif) throw new BadRequestException('Expliquez l’archivage.');
    return this.prisma.$transaction(async (db) => {
      await this.requireWrite(old, userId, db);
      const changed = await db.source.updateMany({ where: { id, revision: dto.revision, statutDocumentaire: { not: 'archive' } }, data: { revision: { increment: 1 }, statutDocumentaire: 'archive', publie: false, dateModification: new Date() } });
      if (!changed.count) throw new ConflictException('La source a changé ou a déjà été archivée.');
      const source = await db.source.findUniqueOrThrow({ where: { id } }); await this.version(db, source, userId, motif, 'archivage'); return { id, revision: source.revision };
    });
  }
  async consult(userId: string, id: string, dto: ConsultationDto) {
    const old = await this.source(id, userId);
    if (dto.operation === 'lecture_manuelle' && !['accessible', 'modifiee'].includes(dto.accessibilite)) throw new BadRequestException('Un contenu indisponible ne peut pas être déclaré lu.');
    return this.prisma.$transaction(async (db) => {
      await this.requireWrite(old, userId, db);
      const source = await db.source.findUniqueOrThrow({ where: { id } });
      if (source.revision !== dto.revision || source.statutDocumentaire === 'archive') throw new ConflictException('La version a changé ou a été archivée. Actualisez la fiche.');
      const version = await db.versionSource.findUniqueOrThrow({ where: { sourceId_numero: { sourceId: id, numero: dto.revision } } });
      const record = await db.consultationSource.create({ data: { sourceId: id, versionId: version.id, acteurId: userId, operation: dto.operation, accessibilite: dto.accessibilite, contenuConsulte: dto.operation === 'lecture_manuelle', note: trim(dto.note) } });
      await db.journalDocumentaire.create({ data: { sourceId: id, acteurId: userId, action: 'declaration_consultation', revision: dto.revision, motif: 'Déclaration humaine ; aucun contrôle automatique ni validation scientifique.' } });
      return record;
    });
  }
}
