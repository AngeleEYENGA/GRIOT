import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { get, put } from '@vercel/blob';
import { PrismaService } from '../prisma/prisma.service';
import { MediasService } from './medias.service';

jest.mock('@vercel/blob', () => ({
  del: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}));

describe('MediasService', () => {
  let service: MediasService;
  let moduleRef: TestingModule;
  const originalBlobStoreId = process.env.BLOB_STORE_ID;
  const prisma = {
    personne: {
      findFirst: jest.fn(),
    },
    media: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.BLOB_STORE_ID = 'test-store';
    prisma.personne.findFirst.mockResolvedValue({ id: 'person-1' });
    prisma.media.create.mockResolvedValue({
      id: 'media-1',
      type: 'photo',
      tailleOctets: 10,
      dateUpload: new Date('2026-01-01T00:00:00.000Z'),
    });
    jest.mocked(put).mockResolvedValue({
      pathname: 'arbres/tree-1/personnes/person-1/photo.jpg',
      url: 'https://blob.example/photo.jpg',
      downloadUrl: 'https://blob.example/photo.jpg',
      contentType: 'image/jpeg',
      contentDisposition: 'inline',
      etag: 'etag',
    });

    moduleRef = await Test.createTestingModule({
      providers: [
        MediasService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(MediasService);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  afterAll(() => {
    if (originalBlobStoreId === undefined) {
      delete process.env.BLOB_STORE_ID;
    } else {
      process.env.BLOB_STORE_ID = originalBlobStoreId;
    }
  });

  it('stores an allowed photo privately and persists only its private pathname', async () => {
    const file = {
      buffer: Buffer.from('image-data'),
      mimetype: 'image/jpeg',
      size: 10,
    };

    await service.uploadPersonPhoto('tree-1', 'person-1', file);

    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^arbres\/tree-1\/personnes\/person-1\/.+\.jpg$/),
      file.buffer,
      { access: 'private', contentType: 'image/jpeg' },
    );
    expect(prisma.media.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        personneId: 'person-1',
        type: 'photo',
        url: 'arbres/tree-1/personnes/person-1/photo.jpg',
        tailleOctets: 10,
      }),
    }));
  });

  it('rejects unsupported image types before storing anything', async () => {
    await expect(service.uploadPersonPhoto('tree-1', 'person-1', {
      buffer: Buffer.from('not an image'),
      mimetype: 'image/gif',
      size: 12,
    })).rejects.toThrow(BadRequestException);

    expect(put).not.toHaveBeenCalled();
  });

  it('stores supported audio and PDF files as private media records', async () => {
    const audio = {
      buffer: Buffer.from('audio-data'),
      mimetype: 'audio/mpeg',
      size: 10,
    };

    await service.uploadPersonMedia('tree-1', 'person-1', audio);

    expect(put).toHaveBeenCalledWith(
      expect.stringMatching(/^arbres\/tree-1\/personnes\/person-1\/audio\/.+\.mp3$/),
      audio.buffer,
      { access: 'private', contentType: 'audio/mpeg' },
    );
    expect(prisma.media.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'audio' }),
    }));

    await service.uploadPersonMedia('tree-1', 'person-1', {
      buffer: Buffer.from('pdf-data'),
      mimetype: 'application/pdf',
      size: 8,
    });
    expect(prisma.media.create).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ type: 'document' }),
    }));
  });

  it('keeps the photo endpoint restricted to image formats', async () => {
    await expect(service.uploadPersonPhoto('tree-1', 'person-1', {
      buffer: Buffer.from('audio-data'),
      mimetype: 'audio/mpeg',
      size: 10,
    })).rejects.toThrow(BadRequestException);

    expect(put).not.toHaveBeenCalled();
  });

  it('does not expose a photo for a person outside the requested tree', async () => {
    prisma.personne.findFirst.mockResolvedValueOnce(null);

    await expect(service.findPersonPhotos('tree-2', 'person-1')).rejects.toThrow(NotFoundException);
    expect(prisma.media.findMany).not.toHaveBeenCalled();
  });

  it('reads private content only after matching the media to the requested tree', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('photo-bytes'));
        controller.close();
      },
    });
    prisma.media.findFirst.mockResolvedValue({ url: 'private/photo.jpg' });
    jest.mocked(get).mockResolvedValue({
      statusCode: 200,
      stream,
      headers: new Headers(),
      blob: {
        url: 'https://blob.example/photo.jpg',
        downloadUrl: 'https://blob.example/photo.jpg',
        pathname: 'private/photo.jpg',
        contentDisposition: 'inline',
        cacheControl: 'private',
        uploadedAt: new Date('2026-01-01T00:00:00.000Z'),
        etag: 'etag',
        contentType: 'image/jpeg',
        size: 12,
      },
    });

    const photo = await service.getPersonPhotoContent('tree-1', 'media-1');
    const chunks: Buffer[] = [];
    for await (const chunk of photo.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    expect(get).toHaveBeenCalledWith('private/photo.jpg', { access: 'private' });
    expect(Buffer.concat(chunks).toString()).toBe('photo-bytes');
  });
});
