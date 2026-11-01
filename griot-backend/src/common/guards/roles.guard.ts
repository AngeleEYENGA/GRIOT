import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleArbre } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Contrôle d'accès par rôle — au niveau de l'ARBRE, pas au niveau global.
 * Chaque route protégée doit exposer un paramètre `arbreId` (route param,
 * body, ou query) : c'est le cœur du RBAC défini en §7 du dossier de
 * conception ("chaque endpoint vérifie le rôle de l'utilisateur sur
 * l'ARBRE concerné, et non un rôle global").
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesRequis = this.reflector.getAllAndOverride<RoleArbre[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequis || rolesRequis.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const utilisateur = request.user;
    const arbreId = request.params?.arbreId ?? request.body?.arbreId ?? request.query?.arbreId;

    if (!utilisateur || !arbreId) {
      throw new ForbiddenException("Impossible de déterminer les droits sur cet arbre.");
    }

    const membre = await this.prisma.membreArbre.findUnique({
      where: { utilisateurId_arbreId: { utilisateurId: utilisateur.id, arbreId } },
    });

    if (!membre || membre.statut !== 'actif' || !rolesRequis.includes(membre.role)) {
      throw new ForbiddenException("Vous n'avez pas les droits nécessaires sur cet arbre.");
    }

    // Rendu disponible pour les contrôleurs qui veulent connaître le rôle exact.
    request.membreArbre = membre;
    return true;
  }
}
