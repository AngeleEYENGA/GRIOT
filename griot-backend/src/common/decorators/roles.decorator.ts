import { SetMetadata } from '@nestjs/common';
import { RoleArbre } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Déclare les rôles autorisés (au sens MembreArbre.role) pour une route.
 * Utilisé avec RolesGuard, qui résout le rôle de l'utilisateur courant
 * sur l'arbre ciblé par le paramètre de route `arbreId`.
 *
 * Exemple : @Roles('admin', 'editeur')
 */
export const Roles = (...roles: RoleArbre[]) => SetMetadata(ROLES_KEY, roles);
