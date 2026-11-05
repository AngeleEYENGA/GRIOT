import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateArbreDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsIn(['prive', 'public'])
  visibilite?: string;

  @IsOptional()
  @IsBoolean()
  presentationPublique?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  introductionPublique?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  languesPubliques?: string[];
}
