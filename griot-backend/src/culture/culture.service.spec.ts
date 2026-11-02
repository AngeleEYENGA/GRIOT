import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CultureService } from './culture.service';
import { PublicationDto, CarteDto } from './culture.dto';
import { CultureController } from './culture.controller';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('private family culture', () => {
  let service: CultureService; let prisma: any;
  beforeEach(() => {
    prisma = { publicationFamille: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn().mockResolvedValue([]), delete: jest.fn() }, carteLangue: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]), create: jest.fn(), update: jest.fn(), delete: jest.fn() } };
    service = new CultureService(prisma);
  });
  it('guards every cultural endpoint and reserves review to moderators', () => {
    expect(Reflect.getMetadata('__guards__', CultureController)).toEqual([JwtAuthGuard, RolesGuard]);
    for (const name of ['publish', 'create', 'upload']) expect(Reflect.getMetadata(ROLES_KEY, CultureController.prototype[name])).not.toContain('lecteur');
    expect(Reflect.getMetadata(ROLES_KEY, CultureController.prototype.validate)).toEqual(['admin', 'editeur']);
    for (const name of ['publications', 'cartes', 'audio']) expect(Reflect.getMetadata(ROLES_KEY, CultureController.prototype[name])).toContain('lecteur');
  });
  it('cannot reply to a post from another tree', async () => {
    prisma.publicationFamille.findFirst.mockResolvedValue(null);
    await expect(service.publish('tree-a', 'user', { theme: 'discussion', contenu: 'Bonjour', parentId: 'foreign' })).rejects.toThrow(NotFoundException);
    expect(prisma.publicationFamille.findFirst).toHaveBeenCalledWith({ where: { arbreId: 'tree-a', id: 'foreign' } });
    expect(prisma.publicationFamille.create).not.toHaveBeenCalled();
  });
  it('rejects blank publications and nested reply chains', async () => {
    await expect(service.publish('tree', 'user', { theme: 'discussion', contenu: '  ' })).rejects.toThrow(BadRequestException);
    prisma.publicationFamille.findFirst.mockResolvedValue({ parentId: 'root' });
    await expect(service.publish('tree', 'user', { theme: 'discussion', contenu: 'Bonjour', parentId: 'reply' })).rejects.toThrow(BadRequestException);
  });
  it('allows only authors or moderators to delete messages', async () => {
    prisma.publicationFamille.findFirst.mockResolvedValue({ auteurId: 'other' });
    await expect(service.removePublication('tree', 'post', 'user', 'contributeur')).rejects.toThrow(ForbiddenException);
    expect(prisma.publicationFamille.delete).not.toHaveBeenCalled();
    await service.removePublication('tree', 'post', 'user', 'admin');
    expect(prisma.publicationFamille.delete).toHaveBeenCalledWith({ where: { id: 'post' } });
  });
  it('scopes pagination cursors to the same tree and thread', async () => {
    prisma.publicationFamille.findFirst.mockResolvedValue({ parentId: 'another-thread' });
    await expect(service.publications('tree', { cursor: 'id' })).rejects.toThrow(BadRequestException);
    expect(prisma.publicationFamille.findMany).not.toHaveBeenCalled();
  });
  it('does not return recording bytes with the card list', async () => {
    await service.cartes('tree');
    const query = prisma.carteLangue.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ arbreId: 'tree' }); expect(query.select.audio).toBeUndefined();
  });
  it('rejects foreign audio, oversized files and disguised HTML; changing audio resets review', async () => {
    prisma.carteLangue.findFirst.mockResolvedValue(null);
    await expect(service.saveAudio('tree', 'card', 'user', 'admin', { buffer: Buffer.from('OggS'), mimetype: 'audio/ogg' })).rejects.toThrow(NotFoundException);
    prisma.carteLangue.findFirst.mockResolvedValue({ auteurId: 'user' });
    await expect(service.saveAudio('tree', 'card', 'user', 'contributeur', { buffer: Buffer.alloc(600000), mimetype: 'audio/ogg' })).rejects.toThrow(BadRequestException);
    await expect(service.saveAudio('tree', 'card', 'user', 'contributeur', { buffer: Buffer.from('<html>'), mimetype: 'audio/ogg' })).rejects.toThrow(BadRequestException);
    await service.saveAudio('tree', 'card', 'user', 'contributeur', { buffer: Buffer.from('OggS000000000'), mimetype: 'audio/ogg' });
    expect(prisma.carteLangue.update.mock.calls[0][0].data.validee).toBe(false);
  });
  it('validates message limits and rejects privilege injection', async () => {
    const post = plainToInstance(PublicationDto, { contenu: 'x'.repeat(4001), theme: 'unexpected' });
    expect((await validate(post)).length).toBeGreaterThan(0);
    const card = plainToInstance(CarteDto, { langue: 'ewo', nomLangue: 'Ewondo', type: 'mot', expression: 'mot', traduction: 'sens', source: 'locuteur', validee: true });
    expect((await validate(card, { whitelist: true, forbidNonWhitelisted: true })).some((error) => error.property === 'validee')).toBe(true);
  });
});
