import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { NatureDocumentaire, StatutDocumentaire, TypeSource } from '@prisma/client';

export class SourceMetadataDto {
  @IsString() @MinLength(1) @MaxLength(250) nom: string;
  @IsOptional() @IsEnum(TypeSource) type?: TypeSource;
  @IsOptional() @IsString() @MaxLength(500) reference?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(150, { each: true }) auteurs?: string[];
  @IsOptional() @IsString() @MaxLength(200) organisme?: string;
  @IsOptional() @IsIn(['livre', 'article', 'archive', 'document_officiel', 'carte', 'image', 'audio', 'video', 'temoignage', 'jeu_de_donnees', 'autre']) categorieDocument?: string;
  @IsOptional() @IsEnum(NatureDocumentaire) nature?: NatureDocumentaire;
  @IsOptional() @IsString() @MaxLength(80) publication?: string;
  @IsOptional() @IsString() @MaxLength(80) langueDocument?: string;
  @IsOptional() @IsString() @MaxLength(2000) url?: string;
  @IsOptional() @IsString() @MaxLength(250) doi?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(120, { each: true }) territoires?: string[];
  @IsOptional() @IsString() @MaxLength(150) periode?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(100, { each: true }) themes?: string[];
  @IsOptional() @IsString() @MaxLength(250) licence?: string;
  @IsOptional() @IsString() @MaxLength(2000) droitsUsage?: string;
}
export class CreateSourceDto extends SourceMetadataDto {
  @IsOptional() @IsUUID() arbreId?: string;
}
export class UpdateSourceDto extends SourceMetadataDto {
  @IsInt() @Min(1) revision: number;
  @IsString() @MinLength(1) @MaxLength(1000) motif: string;
}
export class ArchiveSourceDto {
  @IsInt() @Min(1) revision: number;
  @IsString() @MinLength(1) @MaxLength(1000) motif: string;
}
export class ConsultationDto {
  @IsInt() @Min(1) revision: number;
  @IsIn(['controle_acces', 'lecture_manuelle']) operation: string;
  @IsIn(['accessible', 'restreinte', 'indisponible', 'modifiee']) accessibilite: string;
  @IsOptional() @IsString() @MaxLength(2000) note?: string;
}
export class SourceQuery {
  @IsOptional() @IsUUID() arbreId?: string;
  @IsOptional() @IsString() @MaxLength(100) recherche?: string;
  @IsOptional() @IsEnum(StatutDocumentaire) statut?: StatutDocumentaire;
  @IsOptional() @IsUUID() cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number;
}
