import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateArbreDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsIn(['prive', 'public'])
  visibilite?: string;
}
