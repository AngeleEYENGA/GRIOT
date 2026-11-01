# GRIOT — Backend (Lot 1 : socle)

API backend de GRIOT, construite avec **NestJS 11 + Prisma + PostgreSQL**, en cohérence directe avec `GRIOT-Conception-SI.md` (MCD, RBAC, domaines métier). Le frontend React/Vite est dans `../griot-frontend`.

## Portée de ce Lot 1

Implémenté et fonctionnel :
- **Identity & Trust (V1 léger)** : inscription, connexion, JWT — pas de KYC/OCR (cf. §14 du dossier de conception, volontairement repoussé)
- **Family Management** : création d'arbre, membres, rôles (RBAC réel par arbre)
- **Genealogy Engine** : Personnes, Relations familiales, avec logique Contributeur (proposition) vs Éditeur (modification directe)

Le **schéma de base de données** (`prisma/schema.prisma`) couvre en revanche **toutes** les entités du dossier de conception (Souvenir, Media, Source, Preuve, IdentiteFamiliale, PreferenceAffichage, SyncQueue...), même celles dont l'API n'est pas encore branchée — pour éviter des migrations de structure lourdes plus tard. Les prochains lots (Mémoire, Hors ligne, Visualization Engine...) viendront ajouter les modules NestJS correspondants sur des tables déjà prêtes.

## Prérequis

- Node.js 20+
- Docker (pour la base PostgreSQL locale) — ou une instance PostgreSQL existante

## Démarrage local

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer PostgreSQL en local
docker compose up -d

# 3. Configurer les variables d'environnement
cp .env.example .env
# éditer .env si besoin (DATABASE_URL, JWT_SECRET...)

# 4. Générer le client Prisma
npx prisma generate

# 5. Créer les tables (première migration)
npx prisma migrate dev --name init

# 6. Lancer l'API en mode développement
npm run start:dev
```

Par défaut, `npm run start:dev` démarre l'API sur `http://localhost:3001`.

Scripts utiles :
- `npm run start` -> démarre l'API sur `3001` (par défaut)
- `npm run start:dev` -> mode watch sur `3001` (par défaut)
- `npm run start:dev:clean` -> libère le port `3001` puis démarre en mode watch
- `npm run start:dev:3000` -> mode watch forcé sur `3000`
- `npm run start:dev:3001` -> mode watch forcé sur `3001`

Si tu as un `EADDRINUSE` sur un port, cela signifie qu'un autre processus écoute déjà dessus.

### Dépannage rapide (Windows) : port déjà occupé

```powershell
# Voir le process qui écoute sur le port 3001
Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess

# Variante si tu utilises le port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, OwningProcess

# Afficher le nom du process
Get-Process -Id <PID>

# Arrêter le process (si nécessaire)
Stop-Process -Id <PID> -Force
```

Ensuite, relance `npm run start:dev`.

Le schéma Prisma et le build Nest ont été validés localement. Le démarrage de l’API et les tests avec une base PostgreSQL réelle restent à faire après configuration de `.env`.

## Faire une démo / premiers enregistrements

Le frontend React du dépôt appelle cette API pour les parcours d’authentification, d’arbres, de personnes, de relations et de membres. Swagger reste disponible pour explorer et tester les routes :

### 1. Documentation interactive (Swagger) — pour tester chaque route

Une fois l'API démarrée (`npm run start:dev`), ouvre :

```
http://localhost:3001/docs
```

Tu y trouveras toutes les routes, groupées par module (auth, arbres, membres-arbre, personnes, relations-familiales), avec un bouton **"Try it out"** pour exécuter une vraie requête depuis le navigateur — pas besoin de Postman ni de `curl`.

**Parcours de démo suggéré, dans l'ordre :**
1. `POST /auth/register` — créer un compte (nom, prénom, email, mot de passe)
2. `POST /auth/login` — récupérer un `accessToken`
3. En haut à droite de la page Swagger, clique sur **"Authorize"** et colle le token (juste le token, sans le mot "Bearer" devant — Swagger l'ajoute automatiquement)
4. `POST /arbres` — créer un arbre (tu en deviens automatiquement Administrateur)
5. `POST /arbres/{arbreId}/personnes` — ajouter une première personne (récupère l'`arbreId` retourné à l'étape précédente)
6. `POST /arbres/{arbreId}/relations` — relier deux personnes entre elles
7. `POST /arbres/{arbreId}/membres` — inviter un deuxième compte sur l'arbre (il doit déjà exister — crée un second compte via `/auth/register` pour tester)

### 2. Prisma Studio — pour voir/éditer les données directement

```bash
npx prisma studio
```

Ouvre une interface web (`http://localhost:5555`) qui liste toutes les tables et leur contenu — pratique pour vérifier visuellement ce que Swagger vient de créer, ou pour insérer des données de test à la main sans passer par l'API.

## Vérifier que tout fonctionne

```bash
# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Mvondo","prenom":"Jean","email":"jean@example.com","motDePasse":"motdepasse123"}'

# Connexion (récupère un accessToken)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean@example.com","motDePasse":"motdepasse123"}'

# Créer un arbre (remplacer TOKEN par l'accessToken reçu)
curl -X POST http://localhost:3001/api/arbres \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"nom":"Famille Mvondo"}'
```

## Structure du projet

```
src/
  auth/                 Inscription, connexion, JWT
  arbres/                Gestion des arbres généalogiques
  membres-arbre/          Membres, invitations, rôles
  personnes/              CRUD des personnes (avec RBAC)
  relations-familiales/    Relations entre personnes
  common/
    decorators/roles.decorator.ts   @Roles(...)
    guards/roles.guard.ts           Vérification du rôle SUR L'ARBRE
  prisma/                Service Prisma (connexion DB)
  app.module.ts
  main.ts
prisma/
  schema.prisma          Modèle de données complet
```

## Comment le RBAC fonctionne

Chaque route protégée par `@Roles(...)` est imbriquée sous `/arbres/:arbreId/...`. Le `RolesGuard` va chercher, pour l'utilisateur authentifié, son `MembreArbre` sur **cet arbre précis** — pas un rôle global. C'est la traduction directe de la règle du §7 du dossier de conception : *"chaque endpoint vérifie le rôle de l'utilisateur sur l'arbre concerné, et non un rôle global"*.

## Lots encore à construire

Le MVP inclut désormais les souvenirs avec commentaires et médias privés, les parcours migratoires, les preuves et les espaces institutionnels protégés. Les lots restant à développer sont la synchronisation hors ligne complète, les fonctions IA et le moteur de visualisation avancé; voir `GRIOT-Conception-SI.md`, section Roadmap.

## Déploiement

Le backend est configuré pour Vercel Functions. Les étapes pour déployer le frontend et l’API en deux projets Vercel, configurer PostgreSQL et activer Google OAuth sont dans [DEPLOYMENT-VERCEL.md](../DEPLOYMENT-VERCEL.md). Appliquer les migrations de production avec `npx prisma migrate deploy`, jamais avec `migrate dev`.
