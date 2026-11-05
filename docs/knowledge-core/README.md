# GRIOT Knowledge Core — dossier de validation

**Architecture validée par la responsable du projet le 5 novembre 2026.** Audit initial sur le commit applicatif `60b65f2`, base locale examinée en lecture seule. La première implémentation concerne maintenant le registre des sources : voir [le rapport de phase 3](PHASE-3-SOURCES.md). Aucun RAG ni service d’IA externe n’est activé.

## Décision validée

Conserver un Knowledge Core partagé dans l’architecture NestJS / Prisma / PostgreSQL actuelle, avec un registre documentaire commun, des connaissances sourcées et versionnées, une séparation stricte entre corpus éditorial public et contributions familiales privées, puis une recherche hybride évaluée avant choix de son composant sémantique.

La validation porte sur ce cadre et l’ordre des phases. Elle n’autorise pas à publier une contribution familiale, à accorder des rôles de curation ou à engager un service payant. Les dépendances et modifications de chaque phase seront présentées avant son démarrage, conformément à la demande initiale.

## Documents à examiner

| Document | Contenu |
| --- | --- |
| [Demande initiale](DEMANDE-INITIALE.md) | Cahier des charges transmis, conservé sans reformulation |
| [Audit de l’existant](AUDIT.md) | Composants réellement présents, constats en base locale, réutilisation et lacunes |
| [Architecture proposée](ARCHITECTURE.md) | Modèle conceptuel, preuves, versions, recherche, sécurité et coûts |
| [Réalisation et recette](REALISATION-ET-RECETTE.md) | Huit phases, dépendances et couverture des douze critères d’acceptation |
| [Phase 3 — registre des sources](PHASE-3-SOURCES.md) | Fonctionnement, droits, API, migration, tests et limites du premier lot |
| [Articulation des trois modules](../modules/ARCHITECTURE-PARTAGEE.md) | Autonomie sans arbre de Language/Peoples, niveaux A/B/C d’Origins et contrats communs |
| Cahiers des charges des modules | [Origins](../modules/ORIGINS-CAHIER-DES-CHARGES.md), [Language](../modules/LANGUAGE-CAHIER-DES-CHARGES.md), [Peoples & Civilizations](../modules/PEOPLES-CAHIER-DES-CHARGES.md) |

## Ce que cette étape livre

- Un inventaire des fonctions existantes et de leur provenance documentaire.
- Une proposition de modèle, de contrats entre modules et de droits d’accès.
- Une stratégie de reprise des références actuelles sans les déclarer consultées ou vérifiées par défaut.
- Un plan de réalisation et de recette, avec les points de décision encore ouverts.

**Knowledge Core reste partiel.** Le registre des sources, ses versions et ses déclarations de consultation constituent le premier lot. L’assistant actuel, les cours et les récits ne consomment pas encore des connaissances extraites de ce registre. Aucun moteur documentaire sémantique ou RAG n’a été ajouté.

## Cadre approuvé ; décisions opérationnelles encore nécessaires

1. Réutilisation du modèle `Source`, tout en conservant les preuves familiales distinctes des appuis documentaires d’une affirmation.
2. Validation éditoriale indépendante des rôles d’administration d’un arbre ; aucun rôle de curateur attribué automatiquement.
3. Démarrage par les sources, consultations, versions et segments avant toute génération documentaire.
4. Recherche sémantique et génération choisies sur un jeu d’évaluation multilingue ; fournisseur et budget laissés ouverts.
5. Pas d’envoi de données familiales privées à un fournisseur externe par défaut.

Les limites d’hébergement de production, les extensions autorisées par le PostgreSQL hébergé, les quotas et les habilitations devront être confirmés avant les phases concernées. L’audit local ne les établit pas.

La validation de l’architecture ne nomme pas de curateur global. Les membres de famille peuvent utiliser leur registre selon leurs rôles existants ; le corpus éditorial exige une habilitation distincte, non attribuée automatiquement.
