import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { del, get, put } from '@vercel/blob';
import { PrismaService } from '../prisma/prisma.service';

const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const SUPPORTED_MEDIA: Record<string, { extension: string; type: 'photo' | 'audio' | 'video' | 'document' }> = {
  'image/jpeg': { extension: 'jpg', type: 'photo' },
  'image/png': { extension: 'png', type: 'photo' },
  'image/webp': { extension: 'webp', type: 'photo' },
  'audio/mpeg': { extension: 'mp3', type: 'audio' },
  'audio/mp4': { extension: 'm4a', type: 'audio' },
  'audio/ogg': { extension: 'ogg', type: 'audio' },
  'audio/wav': { extension: 'wav', type: 'audio' },
  'audio/webm': { extension: 'webm', type: 'audio' },
  'video/mp4': { extension: 'mp4', type: 'video' },
  'video/webm': { extension: 'webm', type: 'video' },
  'application/pdf': { extension: 'pdf', type: 'document' },
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

  async findPersonMedias(arbreId: string, personneId: string) {
    await this.findPerson(arbreId, personneId);
    return this.prisma.media.findMany({
      where: { personneId },
      select: { id: true, type: true, tailleOctets: true, dateUpload: true },
      orderBy: { dateUpload: 'desc' },
    });
  }

  async uploadPersonPhoto(arbreId: string, personneId: string, file: UploadedPhoto) {
    return this.uploadPersonMedia(arbreId, personneId, file, 'photo');
  }

  async uploadPersonMedia(
    arbreId: string,
    personneId: string,
    file: UploadedPhoto,
    requiredType?: 'photo',
  ) {
    await this.findPerson(arbreId, personneId);
    const supportedMedia = SUPPORTED_MEDIA[file.mimetype];
    if (!supportedMedia || (requiredType && supportedMedia.type !== requiredType)) {
      throw new BadRequestException(
        requiredType === 'photo'
          ? 'Seules les images JPEG, PNG et WebP sont acceptées.'
          : 'Formats acceptés : JPEG, PNG, WebP, MP3, M4A, OGG, WAV, WebM, MP4 et PDF.',
      );
    }
    if (file.buffer.byteLength > MAX_PHOTO_SIZE) {
      throw new BadRequestException('Un fichier média ne peut pas dépasser 4 Mio.');
    }
    this.assertBlobStorageConfigured();

    const pathname = `arbres/${arbreId}/personnes/${personneId}/${supportedMedia.type}/${randomUUID()}.${supportedMedia.extension}`;
    const blob = await put(pathname, file.buffer, {
      access: 'private',
      contentType: file.mimetype,
    });

    try {
      return await this.prisma.media.create({
        data: {
          personneId,
          type: supportedMedia.type,
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
    return this.readPrivateContent(media?.url, 'Photo');
  }

  async getPersonMediaContent(arbreId: string, mediaId: string) {
    const media = await this.prisma.media.findFirst({
      where: {
        id: mediaId,
        personne: { is: { arbreId } },
      },
      select: { url: true },
    });
    return this.readPrivateContent(media?.url, 'Média');
  }

  private async readPrivateContent(pathname: string | undefined, label: string) {
    if (!pathname) {
      throw new NotFoundException(`${label} introuvable sur cet arbre.`);
    }
    this.assertBlobStorageConfigured();

    const blob = await get(pathname, { access: 'private' });
    if (!blob || blob.statusCode !== 200) {
      throw new NotFoundException(`Le fichier ${label.toLowerCase()} est introuvable dans le stockage.`);
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
