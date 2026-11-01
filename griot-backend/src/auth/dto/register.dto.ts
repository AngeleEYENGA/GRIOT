import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  motDePasse: string;
}
