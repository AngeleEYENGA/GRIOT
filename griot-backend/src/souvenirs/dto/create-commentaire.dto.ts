import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentaireDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  contenu: string;
}
