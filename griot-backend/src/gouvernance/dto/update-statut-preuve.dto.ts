import { IsIn } from 'class-validator';

export class UpdateStatutPreuveDto {
  @IsIn(['validee', 'rejetee'])
  statutValidation: 'validee' | 'rejetee';
}
