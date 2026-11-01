import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePersonneDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsDateString()
  dateDeces?: string;

  @IsOptional()
  @IsString()
  villageOrigine?: string;

  @IsOptional()
  @IsString()
  biographie?: string;
}
