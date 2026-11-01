import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { id: payload.sub } });
    if (!utilisateur || utilisateur.statut !== 'actif') {
      throw new UnauthorizedException();
    }
    // Ce qui est retourné ici devient `request.user` dans les contrôleurs.
    return { id: utilisateur.id, email: utilisateur.email, nom: utilisateur.nom, prenom: utilisateur.prenom };
  }
}
