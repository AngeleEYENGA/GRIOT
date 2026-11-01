import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePersonneDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string | null;

  @IsOptional()
  @IsDateString()
  dateDeces?: string | null;

  @IsOptional()
  @IsString()
  villageOrigine?: string;

  @IsOptional()
  @IsString()
  biographie?: string;
}
