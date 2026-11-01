import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { RoleInstitution } from '@prisma/client';

export class InviteInstitutionMembreDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(RoleInstitution)
  role?: RoleInstitution;
}
