import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GeographieService } from './geographie.service';

describe('GeographieService', () => {
  let service: GeographieService;
  let moduleRef: TestingModule;
  const prisma = {
    personne: { findFirst: jest.fn() },
    lieu: { findFirst: jest.fn(), create: jest.fn() },
    migration: { create: jest.fn(), update: jest.fn(), delete: jest.fn(), findFirst: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.personne.findFirst.mockResolvedValue({ id: 'person-1' });
    prisma.lieu.findFirst.mockResolvedValue(null);
    prisma.lieu.create.mockResolvedValue({ id: 'place-1' });
    prisma.migration.create.mockResolvedValue({ id: 'migration-1' });
    moduleRef = await Test.createTestingModule({
      providers: [GeographieService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(GeographieService);
  });

  afterEach(async () => moduleRef.close());

  it('stores a migration only for a person in the selected tree', async () => {
    await service.create('tree-1', {
      personneId: 'person-1',
      lieu: 'Nkolbisson',
      pays: 'Cameroun',
      latitude: 3.86,
      longitude: 11.48,
    });

    expect(prisma.personne.findFirst).toHaveBeenCalledWith({
      where: { id: 'person-1', arbreId: 'tree-1' },
      select: { id: true },
    });
    expect(prisma.migration.create).toHaveBeenCalled();
  });

  it('rejects coordinates unless both latitude and longitude are supplied', async () => {
    await expect(service.create('tree-1', {
      personneId: 'person-1',
      lieu: 'Nkolbisson',
      latitude: 3.86,
    })).rejects.toThrow(BadRequestException);

    expect(prisma.lieu.create).not.toHaveBeenCalled();
  });

  it('does not attach a migration to a person outside the tree', async () => {
    prisma.personne.findFirst.mockResolvedValue(null);

    await expect(service.create('tree-1', {
      personneId: 'foreign-person',
      lieu: 'Nkolbisson',
    })).rejects.toThrow(NotFoundException);

    expect(prisma.migration.create).not.toHaveBeenCalled();
  });

  it('matches coordinates as well as names so a positioned step cannot reuse an unlocated shared place', async () => {
    await service.create('tree-1', { personneId: 'person-1', lieu: 'Yaoundé', pays: 'Cameroun', latitude: 3.8, longitude: 11.5 });
    expect(prisma.lieu.findFirst).toHaveBeenCalledWith({ where: expect.objectContaining({ latitude: 3.8, longitude: 11.5 }) });
    expect(prisma.lieu.create).toHaveBeenCalled();
  });

  it('updates only a step in the selected tree without modifying a shared place', async () => {
    prisma.migration.findFirst.mockResolvedValue({ id: 'migration-1' });
    prisma.migration.update.mockResolvedValue({ id: 'migration-1' });
    await service.update('tree-1', 'migration-1', { personneId: 'person-1', lieu: 'Yaoundé', latitude: 3.8, longitude: 11.5 });
    expect(prisma.migration.findFirst).toHaveBeenCalledWith({ where: { id: 'migration-1', personne: { arbreId: 'tree-1' } }, select: { id: true } });
    expect(prisma.migration.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ lieuId: 'place-1', dateEvenement: null }) }));
  });

  it('rejects edits of foreign steps or a reassignment to a person outside the tree', async () => {
    prisma.migration.findFirst.mockResolvedValue(null);
    await expect(service.update('tree-1', 'foreign-step', { personneId: 'person-1', lieu: 'Paris' })).rejects.toThrow(NotFoundException);
    prisma.migration.findFirst.mockResolvedValue({ id: 'migration-1' });
    prisma.personne.findFirst.mockResolvedValue(null);
    await expect(service.update('tree-1', 'migration-1', { personneId: 'foreign-person', lieu: 'Paris' })).rejects.toThrow(NotFoundException);
    expect(prisma.migration.update).not.toHaveBeenCalled();
  });
});
