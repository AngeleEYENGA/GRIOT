# Déploiement GRIOT sur Vercel et GitHub

Le dépôt se déploie comme deux projets Vercel reliés au même dépôt GitHub :

1. `griot-frontend` : application React/Vite, racine du projet `griot-frontend`, commande de build `npm run build`, sortie `dist`. Déployée sur `https://griot-frontend-teal.vercel.app`.
2. `griot-backend` : API NestJS sur une Vercel Function, racine du projet `griot-backend`. Vercel utilise la prise en charge NestJS native à partir de `src/main.ts`. Domaine actuel : `https://griot-backend-bice.vercel.app`.

PostgreSQL doit être fourni par un service managé compatible Prisma. Les fichiers Docker Compose ne servent qu’au développement local.

## Variables d’environnement

Dans le projet Vercel du backend, configurer :

- `DATABASE_URL` : URL PostgreSQL de production (utiliser l’URL poolée si le fournisseur la recommande).
- `JWT_SECRET` : secret aléatoire long, propre à la production.
- `JWT_EXPIRES_IN` : durée du JWT, par exemple `1d`.
- `GOOGLE_CLIENT_ID` : identifiant client OAuth Google.
- `FRONTEND_URL` : origine exacte du frontend Vercel. Plusieurs origines sont séparées par des virgules si nécessaire.

Dans le projet Vercel du frontend :

- `VITE_API_URL` : URL du projet API Vercel suivie de `/api` (`https://griot-backend-bice.vercel.app/api`).
- `VITE_GOOGLE_CLIENT_ID` : même identifiant client Google (cet identifiant est public).

Ne jamais placer `JWT_SECRET`, un secret OAuth Google ou un mot de passe de base dans une variable `VITE_*` : ces variables sont intégrées au JavaScript public.

## Google OAuth

Dans Google Cloud Console, le client OAuth **Application Web** `GRIOT Web Client` est créé dans le projet `navigue-512922`. Les origines JavaScript `http://localhost:5173` et `https://griot-frontend-teal.vercel.app` y sont autorisées. L’identifiant client est renseigné dans les deux projets Vercel. Cette intégration utilise le jeton d’identification Google envoyé à l’API ; l’API en vérifie la signature, l’audience et l’email confirmé avant d’émettre son propre JWT.

Le client Web GRIOT a été créé dans le projet Google Cloud `navigue-512922`. Son ID public est dans les fichiers `.env.example`. La clé privée Google n’est pas nécessaire dans ce flux. Ne jamais publier de secrets OAuth. L’origine locale `http://localhost:5173` est déjà autorisée ; ajouter le domaine réel du frontend à l’ID client après sa création dans Vercel. Vérifier également l’écran de consentement et les utilisateurs de test avant d’ouvrir l’application au public.

## Base de données et migrations

**L’API est déployée sur Vercel mais n’est pas encore opérationnelle** : il lui manque une base PostgreSQL persistante et un `JWT_SECRET` de production. Ajouter `DATABASE_URL` et `JWT_SECRET` dans les variables du projet backend avant de considérer l’API en service. Appliquer les migrations une seule fois depuis un environnement de livraison sûr : `npx prisma migrate deploy` dans `griot-backend`. Ne pas utiliser `prisma migrate dev` en production et ne pas lancer les migrations au démarrage de chaque fonction.

La migration `20261101000000_google_oauth` ajoute la table des identités Google et rend le mot de passe facultatif pour les comptes OAuth. Conserver une sauvegarde de la base avant toute migration en production.

## Développement local

Copier `griot-backend/.env.example` en `.env` dans le dossier backend et configurer `DATABASE_URL`, puis copier `griot-frontend/.env.example` en `.env` dans le dossier frontend. Pour Google en local, utiliser le même client ID, avec `http://localhost:5173` autorisé côté Google. Les fichiers `.env` sont exclus de Git.

## GitHub

Le workflow `.github/workflows/ci.yml` vérifie le lint et le build frontend ainsi que la génération Prisma et le build backend à chaque push ou pull request vers `main` et `develop`. Dans Vercel, importer les deux projets depuis le dépôt et activer les déploiements automatiques.