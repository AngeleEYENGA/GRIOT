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
- `BLOB_STORE_ID` : fourni automatiquement en reliant un store Vercel Blob privé au projet backend.

Dans le projet Vercel du frontend :

- `VITE_API_URL` : URL du projet API Vercel suivie de `/api` (`https://griot-backend-bice.vercel.app/api`).
- `VITE_GOOGLE_CLIENT_ID` : même identifiant client Google (cet identifiant est public).

Ne jamais placer `JWT_SECRET`, un secret OAuth Google ou un mot de passe de base dans une variable `VITE_*` : ces variables sont intégrées au JavaScript public.

## Photos privées (Vercel Blob)

Le store privé `griot-backend-blob` est créé en région `fra1` et relié au projet `griot-backend` pour Production et Preview. Vercel fournit `BLOB_STORE_ID` et l'authentification OIDC au runtime. Aucun jeton Blob n'est stocké dans le dépôt ni exposé au frontend. Après toute modification de cette liaison, redéployer le backend pour qu'il récupère les variables.

Le backend enregistre uniquement le chemin interne du Blob, jamais une URL publique. La lecture passe par une route API authentifiée, vérifie l'appartenance à l'arbre et relaie le fichier; le navigateur n'accède donc pas directement au store. Les membres admin, éditeur et contributeur peuvent charger des photos JPEG/PNG/WebP, des enregistrements MP3/M4A/OGG/WAV/WebM, des vidéos MP4/WebM ou des PDF de 4 Mio maximum sur les profils. Le backend contrôle le type réel du fichier. Tous les membres actifs de l'arbre peuvent consulter les médias.

Le projet Vercel est sur l'offre Hobby : le quota inclus affiché pour ce store est de 1 Go de stockage moyen, 10 000 opérations simples, 2 000 avancées et 10 Go de transfert. Blob est gratuit sur Hobby dans ces limites; si elles sont dépassées, l'accès au stockage est suspendu jusqu'au renouvellement du quota, sans facturation d'usage supplémentaire. Voir la [tarification officielle Vercel Blob](https://vercel.com/docs/vercel-blob/usage-and-pricing).

En local, utilisez un store de développement et les variables `BLOB_STORE_ID` / `BLOB_READ_WRITE_TOKEN` dans le `.env` local du backend. Ne transmettez jamais le jeton dans le dépôt, les journaux ou la conversation.

## Google OAuth

Dans Google Cloud Console, le client OAuth **Application Web** `GRIOT Web Client` est créé dans le projet `navigue-512922`. Les origines `http://localhost:5173` et `https://griot-frontend-teal.vercel.app` sont autorisées. L’identifiant client public est renseigné dans le frontend Vercel et les exemples d’environnement. Le flux vérifie le jeton Google côté API. Le client OAuth est en mode « Test » : seuls les utilisateurs tests (dont le compte propriétaire) peuvent se connecter. Les URLs Vercel de prévisualisation ne sont pas encore autorisées.

## Base de données et migrations

**État actuel :** la base Neon est créée et reliée au projet backend. `DATABASE_URL` et `DATABASE_URL_UNPOOLED` sont gérées par l’intégration Vercel. Des `JWT_SECRET` distincts pour Production et Preview sont générés directement dans les variables Vercel. Configurer la commande de build du projet backend sur `npm run build:vercel`. Cette commande génère explicitement le client Prisma, applique ensuite `prisma migrate deploy`, puis compile NestJS. Le hook `prebuild` réalise aussi ces étapes lorsque Vercel lance la commande standard `npm run build`. Ne jamais utiliser `prisma migrate dev` en production ni lancer les migrations à chaque démarrage de fonction.

Les migrations `20261101000000_google_oauth` et `20261101120000_product_features` ajoutent respectivement les identités Google, les commentaires de souvenirs, les adhésions institutionnelles et les métadonnées des notifications. Conserver une sauvegarde de la base avant toute migration en production.

## Écrans connectés et ordre de déploiement

La console chefferie, les commentaires de souvenirs et les invitations institutionnelles utilisent les nouvelles tables de la migration `20261101120000_product_features`. Le backend doit donc être déployé avec `npm run build:vercel` avant le frontend; cette commande applique les migrations avant la compilation. Les médias audio restent privés dans Vercel Blob et transitent par les routes API authentifiées.

La recherche publique ne retourne que le nom de l’arbre et un décompte de personnes pour les arbres ayant explicitement la visibilité `public`. Les profils, souvenirs et médias restent protégés par l’authentification et l’appartenance à l’arbre. Les coordonnées de la carte sont saisies par les membres; aucune API de géocodage externe n’est appelée. La PWA utilise un manifeste, des icônes de 192 et 512 pixels et un service worker qui met en cache uniquement l’app shell et les ressources statiques, jamais les réponses API.

## Développement local

Copier `griot-backend/.env.example` en `.env` dans le dossier backend et configurer `DATABASE_URL` et `DATABASE_URL_UNPOOLED` (identiques pour PostgreSQL local), puis copier `griot-frontend/.env.example` en `.env` dans le dossier frontend. Pour Google en local, utiliser le même client ID, avec `http://localhost:5173` autorisé côté Google. Les fichiers `.env` sont exclus de Git.

## GitHub

Le dépôt GitHub est relié aux deux projets Vercel, avec déploiement automatique. Le workflow `.github/workflows/ci.yml` vérifie le lint/build frontend, l’audit de ses dépendances et la génération Prisma/build backend. Le commit `7cbe082` passe ces contrôles.