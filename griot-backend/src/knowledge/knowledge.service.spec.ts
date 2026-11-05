import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { KnowledgeService } from './knowledge.service';
import { CreateSourceDto, ConsultationDto } from './knowledge.dto';

describe('Knowledge Core source boundaries and provenance', () => {
  let db: any; let service: KnowledgeService;
  const source = { id: 'source', nom: 'Archive de recette', type: 'autre', perimetre: 'arbre', arbreId: 'tree-a', auteurId: 'writer', revision: 1, statutDocumentaire: 'a_examiner', publie: false, cleDedup: null };
  beforeEach(() => {
    db = { habilitationDocumentaire: { findMany: jest.fn().mockResolvedValue([]) }, membreArbre: { findFirst: jest.fn().mockResolvedValue({ role: 'admin' }) }, source: { findFirst: jest.fn().mockResolvedValue(source), findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockImplementation(async ({ data }) => ({ ...source, ...data })), updateMany: jest.fn().mockResolvedValue({ count: 1 }), findUniqueOrThrow: jest.fn().mockResolvedValue(source) }, versionSource: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]), findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'v1' }) }, consultationSource: { create: jest.fn().mockImplementation(async ({ data }) => data), findMany: jest.fn().mockResolvedValue([]) }, journalDocumentaire: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]) } };
    db.$transaction = jest.fn(async (action) => action(db)); service = new KnowledgeService(db);
  });
  it('hides inaccessible and legacy sources before reading their history', async () => {
    db.source.findFirst.mockResolvedValue(null);
    await expect(service.detail('outsider', 'source')).rejects.toThrow(NotFoundException);
    const where = db.source.findFirst.mock.calls[0][0].where;
    expect(where.AND[1].OR[0]).toMatchObject({ perimetre: 'arbre', arbre: { membres: { some: { utilisateurId: 'outsider', statut: 'actif' } } } });
    expect(where.AND[1].OR[1]).toEqual({ perimetre: 'editorial', publie: true, statutDocumentaire: 'verifie' });
    expect(db.versionSource.findMany).not.toHaveBeenCalled();
  });
  it('does not expose internal editorial snapshots or actors to a reader of a published source', async () => {
    db.source.findFirst.mockResolvedValue({ ...source, perimetre: 'editorial', arbreId: null, publie: true, statutDocumentaire: 'verifie' });
    const detail = await service.detail('reader', 'source');
    expect(detail).toMatchObject({ canEdit: false, versions: [], consultations: [], journal: [] });
    expect(detail).not.toHaveProperty('auteurId'); expect(detail).not.toHaveProperty('cleDedup');
    expect(db.versionSource.findMany).not.toHaveBeenCalled();
  });
  it('family administration never grants global editorial write permission', async () => {
    await expect(service.create('writer', { nom: 'Global reference' })).rejects.toThrow(ForbiddenException);
    expect(db.source.create).not.toHaveBeenCalled();
    expect(db.habilitationDocumentaire.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ active: true, utilisateurId: 'writer' }) }));
  });
  it('an explicitly habilitated curator can prepare editorial metadata without publishing it', async () => {
    db.habilitationDocumentaire.findMany.mockResolvedValue([{ role: 'curateur' }]);
    await service.create('writer', { nom: 'Editorial reference' });
    expect(db.source.create.mock.calls[0][0].data).toMatchObject({ perimetre: 'editorial', arbreId: null, auteurId: 'writer' });
    expect(db.source.create.mock.calls[0][0].data).not.toHaveProperty('publie');
  });
  it('a reader cannot create sources and a contributor cannot change another author source', async () => {
    db.membreArbre.findFirst.mockResolvedValue({ role: 'lecteur' });
    await expect(service.create('reader', { nom: 'Test', arbreId: 'tree-a' })).rejects.toThrow(ForbiddenException);
    db.membreArbre.findFirst.mockResolvedValue({ role: 'contributeur' });
    await expect(service.update('other', 'source', { nom: 'Changed', revision: 1, motif: 'Correction' })).rejects.toThrow(ForbiddenException);
    expect(db.source.updateMany).not.toHaveBeenCalled();
  });
  it('normalises a DOI inside its scope, records immutable metadata and does not pretend to read a URL', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch');
    try {
      await service.create('writer', { nom: ' Reference ', arbreId: 'tree-a', doi: 'https://doi.org/10.1234/ABC', url: 'https://example.org/paper?edition=2', auteurs: [' Author ', 'Author'] });
      const data = db.source.create.mock.calls[0][0].data;
      expect(data).toMatchObject({ nom: 'Reference', doi: '10.1234/abc', cleDedup: 'arbre:tree-a:doi:10.1234/abc', auteurs: ['Author'] });
      expect(data).not.toHaveProperty('publie'); expect(data).not.toHaveProperty('statutDocumentaire');
      expect(db.versionSource.create).toHaveBeenCalledWith({ data: expect.objectContaining({ numero: 1, empreinteMetadonnees: expect.stringMatching(/^[a-f0-9]{64}$/) }) });
      expect(db.consultationSource.create).not.toHaveBeenCalled(); expect(db.journalDocumentaire.create).toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    } finally { fetch.mockRestore(); }
  });
  it('URL deduplication preserves document-changing query parameters and stays scoped', async () => {
    for (const [arbreId, url] of [['tree-a', 'https://example.org/doc?edition=1#page=2'], ['tree-a', 'https://example.org/doc?edition=1#page=3'], ['tree-a', 'https://example.org/doc?edition=2'], ['tree-b', 'https://example.org/doc?edition=1']]) await service.create('writer', { nom: 'Document', arbreId, url });
    const keys = db.source.create.mock.calls.map(([arg]) => arg.data.cleDedup);
    expect(keys[0]).toBe(keys[1]); expect(keys[0]).not.toBe(keys[2]); expect(keys[0]).not.toBe(keys[3]);
  });
  it('reports a duplicate without revealing a foreign source identifier', async () => {
    db.source.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create('writer', { nom: 'Doc', arbreId: 'tree-a' })).rejects.toThrow(ConflictException);
    expect(db.versionSource.create).not.toHaveBeenCalled();
  });
  it('rejects credential-bearing and executable URLs before any write', async () => {
    for (const url of ['javascript:alert(1)', 'https://name:secret@example.org/doc']) await expect(service.create('writer', { nom: 'Bad', arbreId: 'tree-a', url })).rejects.toThrow(BadRequestException);
    expect(db.source.create).not.toHaveBeenCalled();
  });
  it('does not overwrite a concurrent revision or journal a modification that failed', async () => {
    db.source.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.update('writer', 'source', { nom: 'New', revision: 1, motif: 'Correction' })).rejects.toThrow(ConflictException);
    expect(db.source.updateMany.mock.calls[0][0].where).toMatchObject({ id: 'source', revision: 1 });
    expect(db.versionSource.create).not.toHaveBeenCalled(); expect(db.journalDocumentaire.create).not.toHaveBeenCalled();
  });
  it('logs an access check as a human declaration with no claim of content reading or verification', async () => {
    const result = await service.consult('writer', 'source', { revision: 1, operation: 'controle_acces', accessibilite: 'accessible', note: 'Lien présent' });
    expect(result).toMatchObject({ versionId: 'v1', contenuConsulte: false, operation: 'controle_acces' });
    expect(db.source.updateMany).not.toHaveBeenCalled();
    expect(db.journalDocumentaire.create.mock.calls[0][0].data.motif).toContain('aucun contrôle automatique');
  });
  it('rejects impossible manual reading and stale consultation versions', async () => {
    await expect(service.consult('writer', 'source', { revision: 1, operation: 'lecture_manuelle', accessibilite: 'indisponible' })).rejects.toThrow(BadRequestException);
    await expect(service.consult('writer', 'source', { revision: 2, operation: 'lecture_manuelle', accessibilite: 'accessible' })).rejects.toThrow(ConflictException);
    expect(db.consultationSource.create).not.toHaveBeenCalled();
  });
  it('never trusts publication, actor, content hash or validation flags provided by a client', async () => {
    const dto = plainToInstance(CreateSourceDto, { nom: 'Reference', publie: true, auteurId: 'intruder', statutDocumentaire: 'verifie' });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.map((e) => e.property).sort()).toEqual(['auteurId', 'publie', 'statutDocumentaire']);
    const consultation = plainToInstance(ConsultationDto, { revision: 1, operation: 'lecture_manuelle', accessibilite: 'accessible', provenance: 'automatique', empreinteContenu: 'fake' });
    expect((await validate(consultation, { whitelist: true, forbidNonWhitelisted: true })).length).toBe(2);
  });
  it('archives without deleting source history', async () => {
    db.source.findUniqueOrThrow.mockResolvedValue({ ...source, revision: 2, statutDocumentaire: 'archive' });
    await service.archive('writer', 'source', { revision: 1, motif: 'Référence remplacée' });
    expect(db.source.updateMany.mock.calls[0][0].data).toMatchObject({ statutDocumentaire: 'archive', publie: false });
    expect(db.versionSource.create.mock.calls[0][0].data.numero).toBe(2);
    expect(db.journalDocumentaire.create.mock.calls[0][0].data.action).toBe('archivage');
  });
  it('rejects an unrelated pagination cursor before enumerating sources', async () => {
    db.source.findFirst.mockResolvedValue(null);
    await expect(service.list('writer', { arbreId: 'tree-a', cursor: 'foreign-id' })).rejects.toThrow(BadRequestException);
    expect(db.source.findMany).not.toHaveBeenCalled();
  });
});
