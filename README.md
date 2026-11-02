# GRIOT — Mémoire familiale

**Préserver. Transmettre. Relier.**

GRIOT est une application de généalogie et de mémoire familiale portée par GAM Labs. Elle réunit les personnes, les liens de parenté, les récits, les médias et les lieux qui composent l’histoire d’une famille.

Une mémoire familiale ne se résume pas à des noms et des dates. Elle comprend aussi une recette transmise, la voix d’un aîné, un village d’origine, une photographie ou un témoignage. GRIOT offre un espace commun pour conserver ces éléments, les relier aux personnes et les enrichir progressivement avec ses proches. Chaque arbre possède ses membres et ses propres droits d’accès.

**[Ouvrir GRIOT](https://griot-frontend-teal.vercel.app/)** · **[Documentation API](https://griot-backend-bice.vercel.app/docs)**

## Pour qui ?

- Les familles qui construisent leur arbre et transmettent leurs histoires.
- Les membres de la diaspora qui documentent leurs origines et les parcours familiaux.
- Les proches qui recueillent des récits, traditions, photos et archives.
- Les acteurs de la transmission institutionnelle, avec les espaces chefferie et les rôles dédiés.

Les membres apportent les informations : un lieu proposé, une relation ou une réponse de l’assistant ne constitue pas à lui seul une preuve historique.

## GAM Labs et contact

Les pages publiques [À propos de nous](https://griot-frontend-teal.vercel.app/#/a-propos) et [Contact](https://griot-frontend-teal.vercel.app/#/contact) présentent la mission, les valeurs et l’équipe associée, sans nécessiter de compte. Elles sont accessibles depuis l’accueil et le pied de page des espaces familiaux.

- **IROUNG à NYAM Jean Merveil** : communication, marketing et négociation.
- **EYENGA ABESSOLO Angèle Myrlaine** : architecture, technologie, fonctions produit et opérations.

Contact commun : **[contact.gamlabs@proton.me](mailto:contact.gamlabs@proton.me)**. Les liens de contact ouvrent la messagerie de l’utilisateur avec un objet adapté ; ils n’envoient aucun message automatiquement.

## Premiers pas et navigation

1. Créez un compte ou connectez-vous. Google OAuth nécessite la configuration décrite dans [DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md).
2. Depuis le **tableau de bord**, choisissez un arbre ou créez votre premier espace familial.
3. Dans **Fiche personne**, ajoutez prénom, nom, dates, biographie et lieu d’origine.
4. Dans **Relations**, reliez deux personnes et consultez ensuite l’arbre généalogique.
5. Dans **Mémoire familiale**, conservez une histoire, une tradition ou un média.
6. Dans **Carte des origines**, associez des lieux et des étapes à une personne.
7. Invitez vos proches avec le rôle adapté. Ils doivent disposer d’un compte et accepter l’invitation depuis la cloche des notifications.

Un **guide de navigation en huit étapes** est disponible avec le bouton **?**, le menu de gauche et le menu mobile **Plus**. Un encart de bienvenue l’indique aux nouveaux utilisateurs. Masquer cet encart conserve l’accès au guide ; ce choix est mémorisé localement par compte et navigateur.

Sur ordinateur, le menu de gauche ouvre les rubriques. Sur mobile, les raccourcis sont en bas et **Plus** affiche les autres écrans. Dans un arbre, **Retour** ramène à la liste des arbres. L’avatar ouvre **Mon compte**.

## Fonctionnalités disponibles

| Espace | Principe |
| --- | --- |
| Accueil familial | Retrouver ses arbres et créer un espace de transmission. |
| Tableau de bord d’un arbre | Chiffres, missions de démarrage, collaborateurs, souvenirs et derniers ajouts. |
| Repères familiaux | Prochains anniversaires des personnes sans date de décès renseignée et complétude des profils : biographie, naissance, origine. |
| Atelier de transmission | Amorces de récits sur les aînés, les traditions et les lieux de mémoire. |
| Généalogie | Représentation des personnes et de leurs liens familiaux. |
| Fiches personnes | Biographies, dates, liens et médias selon les droits attribués. |
| Mémoire familiale | Souvenirs, traditions, commentaires et médias. |
| Carte des origines | Lieux associés aux personnes et lecture des étapes d’un parcours familial. |
| Rôles & permissions | Membres, invitations et gestion des rôles. |
| Chefferie | Preuves, transmission institutionnelle et membres institutionnels selon les accès. |
| Mon compte | Modification du prénom, du nom et du téléphone ; changement du mot de passe d’un compte local. |
| Guide | Parcours de découverte et réponses aux questions de navigation. |

L’interface est responsive. Les animations respectent la préférence système de réduction des mouvements. La fiche personne possède son propre défilement et peut être fermée avec sa croix, Échap ou un clic sur le fond.

## Pays, villes et position actuelle

Dans **Carte des origines → Ajouter un lieu**, commencez par un pays puis saisissez une ville. Les suggestions sont filtrées par pays, sans distinction de casse ou d’accents. Sélectionner une ville renseigne le pays et les coordonnées ; la région aide à distinguer les homonymes.

Le catalogue intégré comprend **34 195 villes et 252 entrées de pays/territoires**, issues de GeoNames au 1er novembre 2026. L’extrait `cities15000` couvre principalement les villes de plus de 15 000 habitants et les capitales : il n’est pas exhaustif pour les villages. Le fichier est hébergé avec GRIOT, chargé à l’ouverture du formulaire et réutilisé en mémoire.

- **Saisie libre :** un lieu absent ou un catalogue indisponible ne bloque pas l’enregistrement. Les coordonnées peuvent être saisies manuellement.
- **Cohérence :** changer le nom du lieu ou le pays efface les anciennes coordonnées.
- **Position facultative :** le bouton « Utiliser ma position actuelle » déclenche la demande d’autorisation du navigateur. Il renseigne les coordonnées de l’appareil et propose une ville du catalogue située à moins de 75 km, lorsqu’il en existe une.
- **Vérification :** la ville proposée est approximative. La position de votre appareil ne prouve pas l’origine d’un proche ; vérifiez toujours le pays, le lieu et la période avant d’enregistrer.
- **Traitement local :** aucune recherche ni coordonnée n’est envoyée à un géocodeur externe. Le navigateur et le système peuvent utiliser leur propre fournisseur pour déterminer la position.
- **Enregistrement :** le lieu et les coordonnées sont transmis au backend GRIOT seulement lors de l’enregistrement, puis accessibles aux membres autorisés de l’arbre.

Les données sont fournies par **[GeoNames](https://www.geonames.org/)** sous **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**, puis réduites et transformées pour GRIOT. L’attribution apparaît dans le formulaire. Voir les [fichiers sources et leur format](https://download.geonames.org/export/dump/readme.txt) et la [provenance de l’extrait](griot-frontend/public/data/geonames-source.json). Actualisation : `python scripts/update-geography.py`, puis examiner les différences avant publication.

## Impression, rapports et personnalisation

Dans **Rapports & impression**, choisissez les personnes, les liens, les parcours, les biographies et les récits à inclure. Le rapport s’imprime depuis le navigateur ; choisissez **Enregistrer en PDF** pour conserver une copie. Les fichiers médias ne sont pas intégrés. Les personnes et relations peuvent aussi être exportées en CSV, avec protection contre l’interprétation de formules par un tableur.

Le bouton **Imprimer** de la généalogie adapte la vue filtrée à une page A4 paysage. Pour un grand arbre, filtrez une branche afin de conserver des noms lisibles. Les exports restent des documents privés à partager avec discernement.

La **Charte graphique** permet de choisir un mode clair, sombre ou adapté au système et une palette héritage, forêt ou océan. Les changements s’appliquent immédiatement à l’application et sont mémorisés dans le navigateur de cet appareil.

## Utiliser GRIOT au village, hors réseau

1. Sur un appareil personnel, ouvrez GRIOT avec une connexion et choisissez **Mode hors ligne → Activer et préparer mes arbres**.
2. Attendez la confirmation. L’interface, le fond mondial Natural Earth et le catalogue de villes sont disponibles après préparation ; les données textuelles des arbres sont conservées dans IndexedDB, séparées par compte.
3. Sans réseau, retrouvez les arbres préparés et leurs données. Les copies peuvent être anciennes ; les médias privés ne sont pas téléchargés.
4. Ajoutez des personnes, souvenirs textuels, lieux et relations : ce sont des **brouillons locaux**, pas encore publiés pour la famille. Ils survivent à un rechargement de la page.
5. Au retour du réseau, choisissez **Envoyer les brouillons**. Le serveur vérifie la session et les permissions. Les références aux personnes créées hors ligne sont remplacées par les identifiants confirmés par le serveur.
6. Si le serveur refuse un ajout, le brouillon est conservé. Si une réponse est incertaine après une coupure, le brouillon est bloqué pour éviter un doublon : vérifiez l’arbre en ligne et sauvegardez les notes avant une reprise manuelle.

Si la session a expiré pendant le séjour, utilisez **Reprendre la connexion sans perdre les brouillons** sur cette même page, avec le mot de passe ou Google selon votre compte. Il n’est pas nécessaire de se déconnecter et d’effacer les copies. La reconnexion est limitée au compte qui a préparé les données locales.

**Sauvegarder mes brouillons** télécharge une copie JSON ; ce fichier est une sauvegarde, pas un import automatique. La déconnexion ou l’effacement des copies supprime les données locales du compte. Une confirmation est demandée à la déconnexion en présence de brouillons. Le stockage peut aussi être effacé par l’appareil : ce mode ne remplace pas une sauvegarde durable. La copie locale n’est pas chiffrée séparément ; protégez votre appareil et évitez cette option sur un poste partagé.

Le fond **[Natural Earth](https://www.naturalearthdata.com/)** provient des limites de pays à petite échelle et relève du domaine public. Il est hébergé avec GRIOT ; aucune tuile cartographique externe n’est requise. La carte permet de zoomer, de se déplacer, de filtrer par personne et de rejouer les étapes chronologiquement. Les étapes sans date viennent ensuite, selon l’ordre saisi. Les lignes ne constituent pas des itinéraires routiers. Les villages mentionnés dans les profils peuvent être ajoutés comme étapes après confirmation du pays et des coordonnées.

La page **Carte des origines** organise ces données comme un parcours de transmission : résumé des repères connus, parcours individuels distingués par couleur, carte et chronologie liées, puis questions à approfondir. Cliquer sur une étape ou un marqueur affiche la personne, la date et son contexte. Les lieux sans date restent dans une section distincte et ne sont pas intégrés à la lecture chronologique. Les liaisons ne relient jamais deux personnes différentes, deux étapes de même date, ni deux points séparés par une étape datée sans coordonnées.

Les origines déclarées dans les fiches restent distinctes de la première étape datée : celle-ci n’est pas nécessairement un lieu de naissance ou une origine ancestrale. Les administrateurs et éditeurs peuvent compléter une étape existante (pays, date, position) sans en créer une autre ; les corrections nécessitent une connexion. Le bouton **Raconter ce passage** ouvre un souvenir prérempli, associé à la personne, pour recueillir le témoignage qui donnera du sens au lieu. L’utilisateur complète et enregistre ensuite ce récit.

## Rôles et confidentialité

Les droits sont définis **dans chaque arbre**, plutôt que par un rôle global.

| Rôle | Usage principal |
| --- | --- |
| Lecteur | Consulter les informations autorisées. |
| Contributeur | Ajouter du contenu ou soumettre des propositions selon les fonctionnalités. |
| Éditeur | Modifier les informations et les liens autorisés. |
| Administrateur | Gérer les membres, les rôles et les réglages de l’arbre. |

Les profils, souvenirs et médias sont protégés par l’authentification et les contrôles d’appartenance. La recherche publique d’un arbre déclaré public montre son nom et son nombre de personnes ; elle n’ouvre pas ses profils et médias aux visiteurs.

Les médias sont stockés dans un store Vercel Blob privé et servis via l’API authentifiée, avec vérification du type réel et une limite de 4 Mio par fichier. Les formats sont détaillés dans [DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md). La déconnexion retire le jeton de session de cet appareil. Ne partagez pas votre session et ne placez jamais de secrets dans Git.

## Architecture

```text
griot-frontend/     React, Vite, interface responsive et PWA
  src/components/  Navigation, dashboard, lieux et composants partagés
  src/pages/       Écrans familiaux, compte et guide
  src/api/         Client HTTP vers le backend
  src/data/        Pays et territoires GeoNames
  public/data/     Villes et provenance du catalogue
griot-backend/      NestJS, Prisma et PostgreSQL
  src/             Authentification et modules métier
  prisma/          Schéma de données et migrations
scripts/            Actualisation du catalogue géographique
.github/workflows/ Contrôles automatiques frontend et backend
```

Le frontend et le backend sont deux projets Vercel reliés au même dépôt. PostgreSQL est hébergé sur Neon. Le catalogue de lieux ne nécessite pas d’abonnement de géocodage.

## Développement local sous Windows

Prérequis : **Node.js 22+**, npm et Docker pour PostgreSQL local, ou une base PostgreSQL existante. Les commandes utilisent PowerShell et `npm.cmd` pour éviter le blocage éventuel de `npm.ps1`.

### Backend — premier terminal, depuis la racine

```powershell
cd griot-backend
npm.cmd ci
# Seulement si aucun .env local n’existe déjà :
Copy-Item .env.example .env
docker compose up -d
```

Renseignez le `.env` local, notamment un `JWT_SECRET` propre au développement. L’exemple utilise PostgreSQL sur `localhost:5433`. Puis :

```powershell
npm.cmd run prisma:generate
npx.cmd prisma migrate deploy
npm.cmd run start:dev
```

API : `http://localhost:3001/api` · Swagger : `http://localhost:3001/docs`.

### Frontend — deuxième terminal, depuis la racine

```powershell
cd griot-frontend
npm.cmd ci
# Seulement si aucun .env local n’existe déjà :
Copy-Item .env.example .env
npm.cmd run dev
```

Vérifiez **`VITE_API_URL=http://localhost:3001/api`**, avec le suffixe `/api`. Interface : `http://localhost:5173`.

### Vérifications

```powershell
# Dans griot-frontend
npm.cmd run lint
npm.cmd test
npm.cmd run build

# Dans griot-backend
npm.cmd run prisma:generate
npm.cmd run build
npm.cmd test -- --runInBand
```

La CI ajoute les audits de dépendances. Les tests de calcul ne remplacent pas les essais des parcours, du défilement et des permissions GPS dans un navigateur.

## Déploiement et limites

Les changements poussés sur `main` déclenchent GitHub Actions et Vercel. Vérifiez la CI, les deux déploiements et les routes en production. Le backend applique les migrations au build ; ne lancez jamais `prisma migrate dev` sur la base de production. Configuration complète : **[DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md)**.

- L’assistant utilise des réponses guidées et un contexte limité de l’arbre ; ce n’est pas une IA générative connectée à des archives historiques.
- La carte représente les étapes déclarées par la famille sur un fond mondial simplifié. Elle ne permet pas la navigation routière et ne constitue pas une preuve historique.
- Les données géographiques constituent un instantané à vérifier et à actualiser ; elles ne couvrent pas tous les villages.
- Le mode hors ligne couvre les copies préparées et les nouveaux brouillons de personnes, liens, récits textuels et lieux. Modifications, suppressions, invitations et médias nécessitent une connexion. Il ne s’agit pas d’une synchronisation générale des modifications concurrentes.
- « Mon compte » ne propose pas encore le changement d’adresse e-mail ni la suppression de compte. Les comptes Google gèrent leur mot de passe chez Google.

Le modèle métier et la conception du système sont détaillés dans [GRIOT-Conception-SI.md](GRIOT-Conception-SI.md).
