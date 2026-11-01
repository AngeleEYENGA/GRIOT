import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SouvenirsService } from './souvenirs.service';

describe('SouvenirsService', () => {
  let moduleRef: TestingModule;
  const transaction = {
    commentaireSouvenir: { create: jest.fn() },
    notification: { create: jest.fn() },
  };
  const prisma = {
    souvenir: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  let service: SouvenirsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.souvenir.findFirst.mockResolvedValue({
      id: 'memory-1',
      auteurId: 'owner-1',
      titre: 'Souvenir',
    });
    transaction.commentaireSouvenir.create.mockResolvedValue({
      id: 'comment-1',
      auteurId: 'member-1',
    });
    prisma.$transaction.mockImplementation((callback) => callback(transaction));
    moduleRef = await Test.createTestingModule({
      providers: [SouvenirsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(SouvenirsService);
  });

  afterEach(async () => moduleRef.close());

  it('creates a comment and its notification atomically for another author', async () => {
    await service.createComment('tree-1', 'memory-1', 'member-1', { contenu: '  Beau récit.  ' });

    expect(transaction.commentaireSouvenir.create).toHaveBeenCalledWith({
      data: { souvenirId: 'memory-1', auteurId: 'member-1', contenu: 'Beau récit.' },
      include: { auteur: { select: { id: true, nom: true, prenom: true } } },
    });
    expect(transaction.notification.create).toHaveBeenCalledWith({
      data: {
        utilisateurId: 'owner-1',
        type: 'commentaire_souvenir',
        contenu: 'Un membre a commenté votre souvenir « Souvenir ».',
      },
    });
  });

  it('does not notify the author about their own comment', async () => {
    await service.createComment('tree-1', 'memory-1', 'owner-1', { contenu: 'Ajout personnel.' });

    expect(transaction.commentaireSouvenir.create).toHaveBeenCalled();
    expect(transaction.notification.create).not.toHaveBeenCalled();
  });
});
