import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AskAiDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  query: string;

  @IsOptional()
  @IsString()
  arbreId?: string;
}
