# Déploiement GRIOT sur Vercel et GitHub

Le dépôt se déploie comme deux projets Vercel reliés au même dépôt GitHub :

1. `griot-frontend` : application React/Vite, racine du projet `griot-frontend`, commande de build `npm run build`, sortie `dist`. Déployée sur `https://griot-frontend-teal.vercel.app`.
2. `griot-backend` : API NestJS sur une Vercel Function, racine du projet `griot-backend`. Vercel utilise la prise en charge NestJS native à partir de `src/main.ts`. Le build de production doit utiliser `npm run build:vercel` : cette commande applique les migrations Prisma avant de compiler l’API. Domaine actuel : `https://griot-backend-bice.vercel.app`.

PostgreSQL est fourni par Neon via Vercel. Le projet `griot-backend` est relié à la base `neon-gray-anchor` dans la région `fra1` (offre Free). L’intégration crée des variables préfixées `DATABASE_` en Production et Preview, ainsi qu’une branche de base isolée pour Preview. Les fichiers Docker Compose ne servent qu’au développement local.

## Variables d’environnement

Dans le projet Vercel du backend, configurer :

- `DATABASE_URL` : URL PostgreSQL poolée utilisée par Prisma Client.
- `DATABASE_URL_UNPOOLED` : URL PostgreSQL directe utilisée par Prisma Migrate.
- `JWT_SECRET` : secret aléatoire long, propre à la production.
- `JWT_EXPIRES_IN` : durée du JWT, par exemple `1d` (défaut : `1d`).
- `GOOGLE_CLIENT_ID` : identifiant client OAuth Google.
- `FRONTEND_URL` : origine exacte du frontend Vercel. Plusieurs origines sont séparées par des virgules si nécessaire.

Dans le projet Vercel du frontend :

- `VITE_API_URL` : URL du projet API Vercel suivie de `/api` (`https://griot-backend-bice.vercel.app/api`).
- `VITE_GOOGLE_CLIENT_ID` : même identifiant client Google (cet identifiant est public).

Ne jamais placer `JWT_SECRET`, un secret OAuth Google ou un mot de passe de base dans une variable `VITE_*` : ces variables sont intégrées au JavaScript public.

## Google OAuth

Dans Google Cloud Console, le client OAuth **Application Web** `GRIOT Web Client` est créé dans le projet `navigue-512922`. Les origines `http://localhost:5173` et `https://griot-frontend-teal.vercel.app` sont autorisées. L’identifiant client public est renseigné dans le frontend Vercel et les exemples d’environnement. Le flux vérifie le jeton Google côté API. Le client OAuth est en mode « Test » : seuls les utilisateurs tests (dont le compte propriétaire) peuvent se connecter. Les URLs Vercel de prévisualisation ne sont pas encore autorisées.

## Base de données et migrations

**État actuel :** la base Neon est créée et reliée au projet backend. `DATABASE_URL` et `DATABASE_URL_UNPOOLED` sont gérées par l’intégration Vercel. Des `JWT_SECRET` distincts pour Production et Preview sont générés directement dans les variables Vercel. Configurer la commande de build du projet backend sur `npm run build:vercel`, puis redéployer : `prisma migrate deploy` appliquera les migrations de façon idempotente au build avant le démarrage de l’API. Ne jamais utiliser `prisma migrate dev` en production ni lancer les migrations à chaque démarrage de fonction.

La migration `20261101000000_google_oauth` ajoute la table des identités Google et rend le mot de passe facultatif pour les comptes OAuth. Conserver une sauvegarde de la base avant toute migration en production.

## Développement local

Copier `griot-backend/.env.example` en `.env` dans le dossier backend et configurer `DATABASE_URL` et `DATABASE_URL_UNPOOLED` (identiques pour PostgreSQL local), puis copier `griot-frontend/.env.example` en `.env` dans le dossier frontend. Pour Google en local, utiliser le même client ID, avec `http://localhost:5173` autorisé côté Google. Les fichiers `.env` sont exclus de Git.

## GitHub

Le dépôt GitHub est relié aux deux projets Vercel, avec déploiement automatique. Le workflow `.github/workflows/ci.yml` vérifie le lint/build frontend, l’audit de ses dépendances et la génération Prisma/build backend. Le commit `7cbe082` passe ces contrôles.