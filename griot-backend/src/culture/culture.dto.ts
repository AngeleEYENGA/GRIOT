import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength, Matches, IsBoolean } from 'class-validator';

export class PublicationDto {
  @IsString() @MinLength(1) @MaxLength(4000) contenu: string;
  @IsIn(['discussion', 'langue', 'conte', 'cuisine', 'tradition', 'migration']) theme: string;
  @IsOptional() @IsUUID() parentId?: string;
}
export class PublicationQuery {
  @IsOptional() @IsUUID() parentId?: string;
  @IsOptional() @IsUUID() cursor?: string;
}
export class CarteDto {
  @IsString() @Matches(/^[a-z0-9_-]{2,80}$/) langue: string;
  @IsString() @MinLength(1) @MaxLength(100) nomLangue: string;
  @IsIn(['mot', 'alphabet', 'grammaire']) type: string;
  @IsString() @MinLength(1) @MaxLength(300) expression: string;
  @IsString() @MinLength(1) @MaxLength(500) traduction: string;
  @IsOptional() @IsString() @MaxLength(2000) explication?: string;
  @IsString() @MinLength(1) @MaxLength(500) source: string;
}
export class ValidationCarteDto { @IsBoolean() validee: boolean; }
