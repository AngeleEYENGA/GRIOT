import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateMigrationDto {
  @IsString()
  personneId: string;

  @IsString()
  @MaxLength(120)
  lieu: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pays?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsDateString()
  dateEvenement?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordre?: number;
}
