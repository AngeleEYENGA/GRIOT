# GRIOT — démarrage local

GRIOT comprend un frontend React/Vite, une API NestJS/Prisma et une base PostgreSQL. Les services ne sont pas démarrés automatiquement. Les builds frontend et backend ont été validés ; une base réelle, le flux Google et le déploiement doivent encore être configurés pour le test de bout en bout.

## Prérequis

- Node.js 22 (ou 20.19+), npm et Docker Desktop.
- Un client OAuth Google est facultatif en local ; sans configuration Google, le bouton de connexion est masqué.

## 1. Démarrer l’API et PostgreSQL

Dans un terminal PowerShell :

```powershell
Set-Location griot-backend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Vérifier dans `.env` que `DATABASE_URL` utilise le port `5433`, comme dans `.env.example`, et définir un `JWT_SECRET` de développement. Démarrer PostgreSQL et l’API :

```powershell
docker compose up -d
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

L’API écoute sur `http://localhost:3001/api`; Swagger est disponible sur `http://localhost:3001/docs`.

## 2. Démarrer l’interface

Dans un autre terminal :

```powershell
Set-Location griot-frontend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Ouvrir l’URL locale affichée par Vite, normalement `http://localhost:5173`.

## Connexion Google en local

Dans Google Cloud Console, créer un identifiant OAuth **Application Web** et ajouter `http://localhost:5173` aux origines JavaScript autorisées. Définir le même identifiant client public dans `GOOGLE_CLIENT_ID` du `.env` backend et `VITE_GOOGLE_CLIENT_ID` du `.env` frontend. L’API vérifie le jeton Google avant de créer ou retrouver le compte et d’émettre son propre JWT. Aucun secret Google n’est utilisé dans ce flux.

## Parcours actuellement reliés

- Inscription et connexion par email/mot de passe ou Google.
- Création et consultation d’arbres généalogiques.
- Ajout et suppression de personnes, création et consultation de relations.
- Liste des membres et invitations d’utilisateurs ayant déjà un compte.
- Vérification d’accès et des rôles côté API.

La récupération de mot de passe par email n’est pas encore configurée. Les souvenirs, médias, synchronisation hors ligne et plusieurs domaines prévus par le schéma restent à implémenter. Les données nécessitent une base persistante ; ne pas utiliser les identifiants locaux de Docker en production.

## Déploiement et GitHub

Le déploiement Vercel (deux projets : frontend et API) et la configuration PostgreSQL/Google sont détaillés dans [DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md). Le workflow [CI GitHub](.github/workflows/ci.yml) exécute le lint et les builds. Les migrations de production doivent être appliquées une seule fois avec `npx prisma migrate deploy`, pas au démarrage des fonctions.
