import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GouvernanceService } from './gouvernance.service';

describe('GouvernanceService', () => {
  let service: GouvernanceService;
  let moduleRef: TestingModule;
  const transaction = {
    preuve: { update: jest.fn() },
    personne: { update: jest.fn() },
    souvenir: { update: jest.fn() },
  };
  const prisma = {
    institution: { findUnique: jest.fn(), create: jest.fn() },
    preuve: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    personne: { findFirst: jest.fn() },
    souvenir: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(transaction));
    prisma.preuve.findFirst.mockResolvedValue({
      id: 'proof-1',
      personneId: 'person-1',
      souvenirId: null,
    });
    transaction.preuve.update.mockResolvedValue({ id: 'proof-1', statutValidation: 'validee' });
    moduleRef = await Test.createTestingModule({
      providers: [GouvernanceService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(GouvernanceService);
  });

  afterEach(async () => moduleRef.close());

  it('requires a proof to reference a person or a memory', async () => {
    await expect(service.createPreuve('tree-1', 'user-1', {
      type: 'témoignage',
    })).rejects.toThrow(BadRequestException);

    expect(prisma.preuve.create).not.toHaveBeenCalled();
  });

  it('validates a proof and marks its person as family-verified atomically', async () => {
    await service.updatePreuve('tree-1', 'proof-1', { statutValidation: 'validee' });

    expect(transaction.preuve.update).toHaveBeenCalledWith({
      where: { id: 'proof-1' },
      data: { statutValidation: 'validee' },
    });
    expect(transaction.personne.update).toHaveBeenCalledWith({
      where: { id: 'person-1' },
      data: { statutVerification: 'verifie_famille' },
    });
  });
});
