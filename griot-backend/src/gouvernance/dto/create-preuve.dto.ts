import { IsDateString, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreatePreuveDto {
  @IsOptional()
  @IsString()
  personneId?: string;

  @IsOptional()
  @IsString()
  souvenirId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  type: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  urlDocument?: string;

  @IsOptional()
  @IsDateString()
  datePreuve?: string;
}
