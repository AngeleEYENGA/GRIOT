import { IsEnum } from 'class-validator';
import { RoleArbre } from '@prisma/client';

export class UpdateRoleDto {
  @IsEnum(RoleArbre)
  role: RoleArbre;
}
