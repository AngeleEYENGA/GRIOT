import { IsIn, IsString, MaxLength } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  @MaxLength(160)
  nom: string;

  @IsIn(['chefferie', 'archive', 'association'])
  type: 'chefferie' | 'archive' | 'association';
}
