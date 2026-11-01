import { IsEnum, IsString } from 'class-validator';
import { TypeRelation } from '@prisma/client';

export class CreateRelationDto {
  @IsString()
  personneId1: string;

  @IsString()
  personneId2: string;

  @IsEnum(TypeRelation)
  typeRelation: TypeRelation;
}
