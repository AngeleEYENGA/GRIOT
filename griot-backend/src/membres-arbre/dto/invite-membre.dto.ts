import { IsEmail, IsEnum } from 'class-validator';
import { RoleArbre } from '@prisma/client';

export class InviteMembreDto {
  @IsEmail()
  email: string;

  @IsEnum(RoleArbre)
  role: RoleArbre;
}
