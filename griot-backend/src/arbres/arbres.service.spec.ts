import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ArbresService } from './arbres.service';

describe('ArbresService dashboard', () => {
  let service: ArbresService;
  let moduleRef: TestingModule;
  const prisma = {
    arbre: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    membreArbre: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    personne: {
      count: jest.fn(),
    },
    relationFamiliale: {
      count: jest.fn(),
    },
    souvenir: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.membreArbre.findFirst.mockResolvedValue({ id: 'member-1' });
    prisma.arbre.findUnique.mockResolvedValue({ id: 'tree-1', membres: [] });
    prisma.personne.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);
    prisma.relationFamiliale.count.mockResolvedValue(1);
    prisma.souvenir.count.mockResolvedValue(0);
    prisma.membreArbre.count.mockResolvedValue(2);

    moduleRef = await Test.createTestingModule({
      providers: [
        ArbresService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(ArbresService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('calculates missions and progress from persisted tree data', async () => {
    const dashboard = await service.getDashboard('tree-1', 'user-1');

    expect(dashboard.statistiques).toEqual({
      personnes: 3,
      relations: 1,
      souvenirs: 0,
      membres: 2,
    });
    expect(dashboard.completude).toEqual({
      missionsTerminees: 4,
      totalMissions: 5,
      pourcentage: 80,
    });
    expect(dashboard.missions[0]).toMatchObject({
      progression: 2,
      objectif: 2,
      terminee: true,
    });
  });

  it('does not expose dashboard data to a non-member', async () => {
    prisma.membreArbre.findFirst.mockResolvedValueOnce(null);

    await expect(service.getDashboard('tree-1', 'user-2')).rejects.toThrow(ForbiddenException);
    expect(prisma.personne.count).not.toHaveBeenCalled();
  });

  it('only searches public trees and returns aggregate counts, not family records', async () => {
    prisma.arbre.findMany.mockResolvedValue([]);

    await service.findPublic('Mvondo');

    expect(prisma.arbre.findMany).toHaveBeenCalledWith({
      where: {
        visibilite: { in: ['public', 'publique'] },
        nom: { contains: 'Mvondo', mode: 'insensitive' },
      },
      select: {
        id: true,
        nom: true,
        dateCreation: true,
        _count: { select: { personnes: true } },
      },
      orderBy: { dateCreation: 'desc' },
      take: 20,
    });
  });
});
