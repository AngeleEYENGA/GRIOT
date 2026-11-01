import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PersonnesService } from './personnes.service';

describe('PersonnesService', () => {
  let service: PersonnesService;
  let moduleRef: TestingModule;
  const prisma = {
    personne: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.personne.findFirst.mockResolvedValue({ id: 'person-1' });
    prisma.personne.update.mockResolvedValue({ id: 'person-1' });

    moduleRef = await Test.createTestingModule({
      providers: [
        PersonnesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(PersonnesService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('clears optional dates when a profile update sends null', async () => {
    await service.update('tree-1', 'person-1', {
      dateNaissance: null,
      dateDeces: null,
    });

    expect(prisma.personne.update).toHaveBeenCalledWith({
      where: { id: 'person-1' },
      data: {
        dateNaissance: null,
        dateDeces: null,
      },
    });
  });
});
