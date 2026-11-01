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
    migration: { create: jest.fn(), delete: jest.fn(), findFirst: jest.fn() },
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
});
