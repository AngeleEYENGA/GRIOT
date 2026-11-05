# Audit préalable de GRIOT Knowledge Core

Date : 5 novembre 2026. Référence applicative : `60b65f2`.

## Méthode et périmètre

Lecture du schéma Prisma, des services NestJS, des contrôles d’accès, des dépendances, des catalogues frontend et de leurs métadonnées. Vérification locale par des requêtes de comptage et d’inventaire des index/extensions uniquement. Aucun nom de personne, message, document familial, mot de passe ou contenu privé n’est exporté.

La base de production n’a pas été interrogée pour cet audit documentaire. Aucun site cité dans les anciens cours n’a été reconsulté pour prétendre valider ces contenus. Les résultats ci-dessous concernent le code actuel et la base locale à cette date.

## Architecture réellement présente

| Élément | État observé | Conséquence pour Knowledge Core |
| --- | --- | --- |
| Backend | Modules NestJS et service Prisma global, PostgreSQL ; client Prisma installé 5.22.0 | Ajouter un module commun dans ce backend, plutôt que trois services documentaires indépendants |
| Frontend | React/Vite, pages familiales et présentations publiques | Connecteurs progressifs et composants de citation partagés, sans réécriture des arbres |
| Déploiement | GitLab et GitHub synchronisés ; Vercel pour l’application | Séparer les requêtes interactives des travaux longs et vérifier les contraintes du plan avant choix du traitement asynchrone |
| Local | PostgreSQL 16 dans Docker, port hôte 5433 | Environnement de conception et de recette disponible, distinct de la production |
| Authentification | JWT et appartenance active à un arbre ; rôles institutionnels séparés | Réutiliser le contrôle familial ; concevoir une habilitation éditoriale distincte |
| Stockage de fichiers | Vercel Blob privé pour les médias familiaux, contrôle serveur | Réutiliser le fournisseur et ses principes ; ne pas rendre les médias familiaux globaux |
| Hors ligne | IndexedDB par compte et préparation de données, effacement à la déconnexion | Distribuer plus tard des dérivés versionnés autorisés, pas un index privé partagé entre navigateurs |

Le schéma contient des entités prévues dès la conception initiale ; leur présence ne prouve pas une API complète ou leur utilisation effective.

## Sources, preuves et données à réutiliser

| Emplacement vérifié | Présent aujourd’hui | Limite précise |
| --- | --- | --- |
| `griot-backend/prisma/schema.prisma` — `Source` | ID, type, nom, référence, catégorie de fiabilité, liens vers preuves | Pas de bibliographie complète, de consultation/version, de droit de reproduction ou d’ACL documentaire explicite |
| Même schéma — `Preuve` ; `src/gouvernance/gouvernance.service.ts` | Pièce associée à une personne ou un souvenir, auteur, URL et décision familiale/institutionnelle | Ce statut valide une contribution familiale ; il ne constitue pas une validation scientifique globale. L’API de création de preuve ne renseigne actuellement pas `sourceId` |
| `EvenementHistorique` | Événement rattaché à un arbre, année en texte | Pas un catalogue mondial partagé ; pas de précision temporelle ni d’appui documentaire structurés |
| `Lieu`, `Migration` | Noms, pays, coordonnées et présences individuelles datées | Pas de référentiel de territoires historiques ni d’identité géographique canonique ; une présence ne prouve pas une route ou un motif de migration |
| `CarteLangue`, `PublicationFamille` | Contributions privées, source libre, relecture familiale, audio de fiche | Une fiche relue ne devient pas une ressource publique de référence ; pas de licence ou provenance fine de l’audio |
| `src/ai/cultural-knowledge.ts` | Sept références éditoriales, définitions et relations via `sourceIds`, exemples illustrés | Références dans le code ; pas d’historique de consultation ni de preuve au passage pour chaque assertion |
| `src/ai/ai.service.ts` | Réponses déterministes ; contexte familial limité après vérification d’appartenance | Pas de RAG, d’embedding, de recherche Web ou d’appel à un modèle génératif externe |
| `griot-frontend/src/data/historicalContexts.json` | Trois repères historiques et leurs URLs | Corpus séparé dans le frontend, sans registre central des documents/versions/consultations |
| `src/utils/migrationHistory.js` | Récits de présences et rapprochement pays/période ; précautions sur les causes | Rapprochement heuristique, pas une enquête historique ni une inférence causale |
| `src/data/fangCourse.js`, `worldCourses.js` | Cinq initiations, références par élément ou cours | Sources définies séparément, bibliographie hétérogène ; pas de réutilisation centrale des passages et validations |
| `src/utils/languageTutor.js` | Entraînement et révisions guidés | Un moteur pédagogique existant à préserver ; il n’est pas un moteur documentaire |

Le code du corpus culturel indique une relecture éditoriale antérieure. Il ne fournit pas de journal versionné permettant de reconstruire la consultation et les décisions. L’import futur devra conserver cette origine déclarée, avec le statut **à examiner**, sans créer une fausse date de consultation ou une validation scientifique rétroactive.

## Catalogues et provenance déjà disponibles

- `griot-frontend/src/data/languages-source.json` déclare Glottolog 5.3 CLDF, 8 520 entrées, CC BY 4.0, une date de récupération et une empreinte du CSV. Les données sont dans `languages.json`.
- `griot-frontend/public/data/geonames-source.json` déclare 34 195 villes et 252 pays/territoires, CC BY 4.0, la récupération et les empreintes des fichiers sources. Ces métadonnées décrivent un import de jeu de données ; elles ne valident pas chaque entité historique.
- Le fond Natural Earth sert à la carte actuelle. Les limites actuelles ne doivent pas être réinterprétées comme des frontières historiques.

Ces dérivés sont utiles hors ligne. Ils peuvent devenir des distributions versionnées du référentiel commun, plutôt que d’être recopiés comme trois catalogues éditoriaux indépendants. Les identifiants externes et les versions doivent être conservés.

## Vérification de la base locale

Inventaire en lecture seule au 5 novembre, sans échantillons de données personnelles :

| Table logique | Nombre local |
| --- | ---: |
| Source | 0 |
| Preuve | 0 |
| EvenementHistorique | 0 |
| Lieu | 11 |
| Migration | 33 |
| CarteLangue | 0 |

Ces nombres ne décrivent pas la production. Le zéro en base locale ne signifie pas absence de références : les corpus éditoriaux sont dans le code et les fichiers de données.

L’inventaire `pg_extension` local ne retourne que `plpgsql`. Aucun `pgvector` n’est installé localement. Les tables examinées ont leurs clés primaires ; `cartes_langue` possède en plus l’index B-tree `(arbreId, langue)`. Aucun index documentaire `tsvector`/GIN ou index vectoriel n’a été observé sur ces tables.

La recherche des usages dans `src`, les migrations et les dépendances n’a pas identifié de système de vectorisation, de moteur RAG, de file documentaire durable ou d’ordonnanceur de vérification de sources. Les petites dépendances transitives nommées « queue » ne constituent pas une file métier.

## Conclusions de réutilisation

1. **Conserver `Source` comme identité bibliographique**, en l’enrichissant ; ne pas créer parallèlement un registre `KnowledgeSource` contenant les mêmes documents.
2. **Conserver `Preuve` comme preuve familiale**. Ajouter des appuis documentaires entre une connaissance et un passage ; leurs sémantiques ne sont pas interchangeables.
3. **Conserver les lieux et migrations personnels**. Les relier facultativement à des entités de référence, sans fusion fondée sur un nom seul et sans réécriture des événements familiaux.
4. **Conserver les cours, exercices et progrès**. Centraliser progressivement leurs références et ressources ; les identifiants des cours existants restent stables.
5. **Conserver les corpus actuels pendant la transition**. L’absence de Knowledge Core ou du réseau ne doit pas casser les cartes, cours, présentations publiques ou consultations déjà préparées hors ligne.

## Points encore non établis

Les extensions et index autorisés par l’hébergeur de production, son dimensionnement, le plan Vercel, la localisation des données, les quotas externes et les droits documentaires de chaque ouvrage restent à vérifier. Aucun fournisseur d’IA n’est sélectionné. Les trois noms Origins, Language et Peoples & Civilizations décrivent des capacités actuelles/visées : le code n’a pas encore trois modules autonomes portant exactement ces noms.

## Bilan de cette phase

L’audit du code et de la base locale est réalisé. Le modèle proposé dans [ARCHITECTURE.md](ARCHITECTURE.md) doit être validé avant toute migration ou développement. Aucun test applicatif n’est relancé pour ce seul audit documentaire ; les constats s’appuient sur la lecture du code et les requêtes d’inventaire décrites ici. Le plan de recette futur est distinct de tests déjà exécutés.
