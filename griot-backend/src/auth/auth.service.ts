import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const SALT_ROUNDS = 12;
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existant = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (existant) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, SALT_ROUNDS);

    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        email,
        telephone: dto.telephone,
        motDePasseHash,
      },
    });

    // Note V1 : la vérification email/téléphone réelle (envoi de lien/code)
    // est un chantier à part (cf. §14 du dossier de conception) — ici on
    // crée le compte, `emailVerifie` reste à false tant qu'elle n'est pas branchée.

    return this.buildAuthResponse(utilisateur);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (!utilisateur || !utilisateur.motDePasseHash || utilisateur.statut !== 'actif') {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    return this.buildAuthResponse(utilisateur);
  }

  async loginWithGoogle(idToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new ServiceUnavailableException('La connexion Google n’est pas encore configurée.');
    }

    let payload;
    try {
      const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Le jeton Google est invalide ou expiré.');
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException('Google doit fournir une adresse email vérifiée.');
    }

    const email = payload.email.trim().toLowerCase();
    const linkedIdentity = await this.prisma.identiteOAuth.findUnique({
      where: { fournisseur_sujet: { fournisseur: 'google', sujet: payload.sub } },
      include: { utilisateur: true },
    });

    if (linkedIdentity) {
      if (linkedIdentity.utilisateur.statut !== 'actif') {
        throw new UnauthorizedException('Ce compte est désactivé.');
      }
      return this.buildAuthResponse(linkedIdentity.utilisateur);
    }

    let utilisateur = await this.prisma.utilisateur.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (utilisateur && utilisateur.statut !== 'actif') {
      throw new UnauthorizedException('Ce compte est désactivé.');
    }

    if (!utilisateur) {
      const nameParts = (payload.name ?? '').trim().split(/\s+/).filter(Boolean);
      utilisateur = await this.prisma.utilisateur.create({
        data: {
          email,
          emailVerifie: true,
          prenom: payload.given_name ?? nameParts[0] ?? 'Utilisateur',
          nom: payload.family_name ?? nameParts.slice(1).join(' '),
        },
      });
    } else if (!utilisateur.emailVerifie) {
      utilisateur = await this.prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: { emailVerifie: true },
      });
    }

    await this.prisma.identiteOAuth.create({
      data: { utilisateurId: utilisateur.id, fournisseur: 'google', sujet: payload.sub },
    });

    return this.buildAuthResponse(utilisateur);
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email requis.');
    }
    return {
      message: 'La récupération du mot de passe par email n’est pas encore configurée.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException('Le token et le nouveau mot de passe sont requis.');
    }

    const strength = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(newPassword);
    if (!strength) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
    }

    let payload: { sub: string; email: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new BadRequestException('Le lien de réinitialisation est invalide ou expiré.');
    }

    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException('Le lien de réinitialisation est invalide.');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: payload.sub } });
    if (!utilisateur || utilisateur.email !== payload.email) {
      throw new BadRequestException('Le lien de réinitialisation est invalide.');
    }

    const isSame = utilisateur.motDePasseHash
      ? await bcrypt.compare(newPassword, utilisateur.motDePasseHash)
      : false;
    if (isSame) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l’ancien.');
    }

    const motDePasseHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.utilisateur.update({ where: { id: utilisateur.id }, data: { motDePasseHash } });

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async getProfile(utilisateurId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    return {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      langue: utilisateur.langue,
      statut: utilisateur.statut,
      dateCreation: utilisateur.dateCreation,
    };
  }

  async updateProfile(utilisateurId: string, dto: UpdateProfileDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const profile = await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        nom: dto.nom ?? utilisateur.nom,
        prenom: dto.prenom ?? utilisateur.prenom,
        telephone: dto.telephone ?? utilisateur.telephone,
        langue: dto.langue ?? utilisateur.langue,
      },
    });

    return this.getProfile(utilisateurId);
  }

  async changePassword(utilisateurId: string, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Les deux mots de passe sont requis.');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    if (!utilisateur.motDePasseHash) {
      throw new BadRequestException('Ce compte utilise un fournisseur de connexion externe.');
    }

    const motDePasseValide = await bcrypt.compare(currentPassword, utilisateur.motDePasseHash);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }

    const isSame = await bcrypt.compare(newPassword, utilisateur.motDePasseHash);
    if (isSame) {
      throw new BadRequestException('Le nouveau mot de passe doit être différent de l’ancien.');
    }

    const strength = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(newPassword);
    if (!strength) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
    }

    const motDePasseHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.prisma.utilisateur.update({ where: { id: utilisateurId }, data: { motDePasseHash } });

    return { message: 'Mot de passe mis à jour.' };
  }

  private buildAuthResponse(utilisateur: { id: string; email: string; nom: string; prenom: string }) {
    const payload = { sub: utilisateur.id, email: utilisateur.email };
    return {
      accessToken: this.jwtService.sign(payload),
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
      },
    };
  }
}
