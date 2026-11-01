import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MembresArbreService } from './membres-arbre.service';

describe('MembresArbreService role management', () => {
  let service: MembresArbreService;
  let moduleRef: TestingModule;
  const prisma = {
    membreArbre: {
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.membreArbre.findUnique.mockResolvedValue({
      id: 'member-1',
      arbreId: 'tree-1',
      utilisateurId: 'user-1',
      role: 'admin',
      statut: 'actif',
    });
    prisma.membreArbre.count.mockResolvedValue(1);
    prisma.membreArbre.update.mockResolvedValue({ id: 'member-1' });
    moduleRef = await Test.createTestingModule({
      providers: [MembresArbreService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(MembresArbreService);
  });

  afterEach(async () => moduleRef.close());

  it('prevents an administrator from changing their own role', async () => {
    await expect(service.updateRole('tree-1', 'member-1', 'user-1', { role: 'lecteur' }))
      .rejects.toThrow(BadRequestException);

    expect(prisma.membreArbre.update).not.toHaveBeenCalled();
  });

  it('does not allow demoting the last active administrator', async () => {
    await expect(service.updateRole('tree-1', 'member-1', 'user-2', { role: 'editeur' }))
      .rejects.toThrow(BadRequestException);

    expect(prisma.membreArbre.update).not.toHaveBeenCalled();
  });

  it('allows demotion when another active administrator remains', async () => {
    prisma.membreArbre.count.mockResolvedValue(2);

    await service.updateRole('tree-1', 'member-1', 'user-2', { role: 'editeur' });

    expect(prisma.membreArbre.update).toHaveBeenCalledWith({
      where: { id: 'member-1' },
      data: { role: 'editeur' },
    });
  });
});
