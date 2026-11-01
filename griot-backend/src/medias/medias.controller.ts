import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { MediasService, type UploadedPhoto } from './medias.service';

const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
const ACCEPTED_MEDIA_TYPES = /^(image\/(jpeg|png|webp)|audio\/(mpeg|mp4|ogg|wav|webm)|video\/(mp4|webm)|application\/pdf)$/;

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('medias')
@ApiBearerAuth()
@Controller('arbres/:arbreId')
export class MediasController {
  constructor(private readonly mediasService: MediasService) {}

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get('personnes/:personneId/photos')
  findPersonPhotos(
    @Param('arbreId') arbreId: string,
    @Param('personneId') personneId: string,
  ) {
    return this.mediasService.findPersonPhotos(arbreId, personneId);
  }

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get('personnes/:personneId/medias')
  findPersonMedias(
    @Param('arbreId') arbreId: string,
    @Param('personneId') personneId: string,
  ) {
    return this.mediasService.findPersonMedias(arbreId, personneId);
  }

  @Roles('admin', 'editeur', 'contributeur')
  @Post('personnes/:personneId/photos')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_PHOTO_SIZE, files: 1 },
  }))
  uploadPersonPhoto(
    @Param('arbreId') arbreId: string,
    @Param('personneId') personneId: string,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: MAX_PHOTO_SIZE }),
        new FileTypeValidator({
          fileType: /^image\/(jpeg|png|webp)$/,
          overrideMimeType: true,
        }),
      ],
    })) file: UploadedPhoto,
  ) {
    return this.mediasService.uploadPersonPhoto(arbreId, personneId, file);
  }

  @Roles('admin', 'editeur', 'contributeur')
  @Post('personnes/:personneId/medias')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_PHOTO_SIZE, files: 1 },
  }))
  uploadPersonMedia(
    @Param('arbreId') arbreId: string,
    @Param('personneId') personneId: string,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: MAX_PHOTO_SIZE }),
        new FileTypeValidator({
          fileType: ACCEPTED_MEDIA_TYPES,
          overrideMimeType: true,
        }),
      ],
    })) file: UploadedPhoto,
  ) {
    return this.mediasService.uploadPersonMedia(arbreId, personneId, file);
  }

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get('souvenirs/:souvenirId/medias')
  findSouvenirMedias(
    @Param('arbreId') arbreId: string,
    @Param('souvenirId') souvenirId: string,
  ) {
    return this.mediasService.findSouvenirMedias(arbreId, souvenirId);
  }

  @Roles('admin', 'editeur', 'contributeur')
  @Post('souvenirs/:souvenirId/medias')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_PHOTO_SIZE, files: 1 },
  }))
  uploadSouvenirMedia(
    @Param('arbreId') arbreId: string,
    @Param('souvenirId') souvenirId: string,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: MAX_PHOTO_SIZE }),
        new FileTypeValidator({
          fileType: ACCEPTED_MEDIA_TYPES,
          overrideMimeType: true,
        }),
      ],
    })) file: UploadedPhoto,
  ) {
    return this.mediasService.uploadSouvenirMedia(arbreId, souvenirId, file);
  }

  @Roles('admin', 'editeur', 'contributeur', 'lecteur')
  @Get('medias/:mediaId/contenu')
  async getPhotoContent(
    @Param('arbreId') arbreId: string,
    @Param('mediaId') mediaId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const photo = await this.mediasService.getPersonMediaContent(arbreId, mediaId);
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    return new StreamableFile(photo.stream, {
      type: photo.contentType,
      disposition: 'inline',
      length: photo.size,
    });
  }
}
