import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { del, get, put } from '@vercel/blob';
import { PrismaService } from '../prisma/prisma.service';

const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface UploadedPhoto {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Injectable()
export class MediasService {
  constructor(private readonly prisma: PrismaService) {}

  async findPersonPhotos(arbreId: string, personneId: string) {
    await this.findPerson(arbreId, personneId);
    return this.prisma.media.findMany({
      where: { personneId, type: 'photo' },
      select: { id: true, type: true, tailleOctets: true, dateUpload: true },
      orderBy: { dateUpload: 'desc' },
    });
  }

  async uploadPersonPhoto(arbreId: string, personneId: string, file: UploadedPhoto) {
    await this.findPerson(arbreId, personneId);
    const extension = PHOTO_EXTENSIONS[file.mimetype];
    if (!extension) {
      throw new BadRequestException('Seules les images JPEG, PNG et WebP sont acceptées.');
    }
    if (file.buffer.byteLength > MAX_PHOTO_SIZE) {
      throw new BadRequestException('La photo ne peut pas dépasser 4 Mio.');
    }
    this.assertBlobStorageConfigured();

    const pathname = `arbres/${arbreId}/personnes/${personneId}/${randomUUID()}.${extension}`;
    const blob = await put(pathname, file.buffer, {
      access: 'private',
      contentType: file.mimetype,
    });

    try {
      return await this.prisma.media.create({
        data: {
          personneId,
          type: 'photo',
          url: blob.pathname,
          tailleOctets: file.buffer.byteLength,
        },
        select: { id: true, type: true, tailleOctets: true, dateUpload: true },
      });
    } catch (databaseError) {
      try {
        await del(blob.pathname);
      } catch (cleanupError) {
        const detail = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        throw new Error(`Impossible d’enregistrer la photo et de nettoyer le fichier créé : ${detail}`);
      }
      throw databaseError;
    }
  }

  async getPersonPhotoContent(arbreId: string, mediaId: string) {
    const media = await this.prisma.media.findFirst({
      where: {
        id: mediaId,
        type: 'photo',
        personne: { is: { arbreId } },
      },
      select: { url: true },
    });
    if (!media) {
      throw new NotFoundException('Photo introuvable sur cet arbre.');
    }
    this.assertBlobStorageConfigured();

    const blob = await get(media.url, { access: 'private' });
    if (!blob || blob.statusCode !== 200) {
      throw new NotFoundException('Le fichier photo est introuvable dans le stockage.');
    }
    return {
      stream: Readable.fromWeb(blob.stream as Parameters<typeof Readable.fromWeb>[0]),
      contentType: blob.blob.contentType,
      size: blob.blob.size,
    };
  }

  private async findPerson(arbreId: string, personneId: string) {
    const personne = await this.prisma.personne.findFirst({
      where: { id: personneId, arbreId },
      select: { id: true },
    });
    if (!personne) {
      throw new NotFoundException('Personne introuvable sur cet arbre.');
    }
    return personne;
  }

  private assertBlobStorageConfigured() {
    if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
      throw new ServiceUnavailableException(
        'Le stockage privé des médias n’est pas encore configuré sur le backend.',
      );
    }
  }
}
