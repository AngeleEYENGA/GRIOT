import { CategorieSouvenir } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSouvenirDto {
  @IsEnum(CategorieSouvenir)
  categorie: CategorieSouvenir;

  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  contenu?: string;

  @IsOptional()
  @IsString()
  personneId?: string;
}
