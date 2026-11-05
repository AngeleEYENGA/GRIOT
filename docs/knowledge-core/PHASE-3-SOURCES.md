# Phase 3 — premier registre documentaire

Date : 5 novembre 2026. Architecture approuvée dans la conversation avant développement. Cette phase construit la gestion des références ; elle ne rend pas tout Knowledge Core opérationnel.

## Fonctionnement livré

Dans un arbre, **Espace collaboratif & langues → Sources documentaires** permet :

- D’ajouter une référence : titre, auteurs, organisme, type/nature, publication, langue, URL/DOI/référence d’archive, territoires, période, thèmes, licence et usages permis.
- De rechercher dans les métadonnées, filtrer l’état et parcourir les résultats par pages bornées.
- De modifier les métadonnées avec un motif et un numéro de révision ; chaque modification conserve une nouvelle version et l’ancienne reste consultable.
- D’enregistrer un contrôle d’accès ou une lecture déclarée par une personne, liés à la version courante.
- De consulter le journal des opérations et d’archiver une référence avec un motif, sans supprimer ses versions ni ses déclarations.

Le navigateur n’ouvre le site éditeur que sur clic explicite. L’API ne télécharge aucun document. Une consultation est marquée `declaration_manuelle` et horodatée lors de la saisie ; il ne s’agit pas d’une preuve de lecture par GRIOT ni d’une validation scientifique. L’empreinte SHA-256 d’une version porte sur ses **métadonnées**, jamais sur un contenu distant non acquis.

## Données et migration

`Source` est enrichi plutôt que dupliqué. Les champs historiques `type`, `nom`, `reference`, `fiabilite` et les relations de `Preuve` sont conservés. Les nouvelles tables sont `versions_source`, `consultations_source`, `journal_documentaire` et `habilitations_documentaires`.

La migration additive `20261105210000_knowledge_sources` conserve les anciennes sources dans `legacy_restreint`, sans leur attribuer d’accès public. Elles ne sont pas exposées dans le nouveau registre tant que leur périmètre n’a pas été résolu. Aucun ancien document n’est déclaré consulté ou vérifié ; les preuves familiales restent dans leur parcours existant.

Les contraintes incluent : référence de version appartenant à la même source pour une consultation, révisions positives, unicité d’une version, publication réservée au périmètre éditorial vérifié, cohérence de l’arbre privé et des déclarations de lecture. Les versions et le journal sont append-only via l’API : aucun endpoint d’édition ou suppression de ces lignes n’est fourni. Cela ne remplace pas une future politique d’effacement/retention légale côté administration.

## Droits et publication

| Acteur | Registre familial |
| --- | --- |
| Membre actif lecteur | Consulter les références, versions et déclarations de son arbre |
| Contributeur actif | Ajouter une référence ; modifier, déclarer et archiver ses propres références |
| Éditeur/admin actif | Gérer les références de l’arbre |
| Autre famille ou membre dont l’accès n’est plus actif | Aucune lecture ou modification des sources de cet arbre |

Un arbre visible dans la vitrine publique ne rend pas son registre documentaire public. Les membres sont revérifiés côté serveur. Les listes appliquent le périmètre avant la recherche et le curseur de pagination doit appartenir à ce même résultat autorisé.

Le périmètre éditorial commun est préparé côté API avec des habilitations séparées. Un curateur explicitement habilité peut préparer ses métadonnées ; un validateur peut lire les brouillons mais ne reçoit pas implicitement le rôle de curateur. **Aucune habilitation réelle n’a été créée automatiquement.** L’administration d’une famille et l’appartenance à GitLab n’accordent aucun droit éditorial global. Le workflow de validation/publication n’est pas encore implémenté et aucun endpoint ne permet de passer une source à « vérifiée » ou de la publier.

Les champs d’autorité (`auteurId`, `publie`, statut de vérification, provenance automatique, empreinte de contenu) ne sont pas acceptés dans les DTO de création/modification. Le client ne peut ni déplacer une source vers un autre arbre ni choisir ses droits.

## Déduplication et concurrence

Un DOI normalisé sert de clé prioritaire ; à défaut, l’identité d’URL est calculée avec son schéma/hôte normalisé, sans fragment, en conservant les paramètres qui peuvent changer le document. La clé inclut le périmètre familial ou éditorial. Un document privé identique dans deux familles ne crée pas une relation publique entre ces familles.

L’unicité en base protège aussi les créations concurrentes. Sans DOI ni URL, le titre seul n’est pas une preuve de doublon : la comparaison bibliographique manuelle reste nécessaire. La version d’édition et les champs de publication sont à renseigner pour distinguer les documents ; aucune fusion automatique par titre n’est ajoutée.

Les mises à jour et archivages utilisent une révision attendue : une fiche devenue obsolète entre ouverture et enregistrement produit un conflit, plutôt qu’un écrasement silencieux. La version et le journal sont écrits dans la même transaction que la source. Une panne du journal annule la transaction entière.

## Contrats API de ce lot

Tous ces endpoints exigent une session JWT active. Les droits de l’arbre et les éventuelles habilitations sont contrôlés dans le service :

| Méthode | Chemin après `/api` | Usage |
| --- | --- | --- |
| GET | `/knowledge/sources?arbreId=...` | Références familiales autorisées ; recherche, état, curseur et limite de 1 à 50 |
| GET | `/knowledge/sources` | Métadonnées éditoriales autorisées ; pas une lecture anonyme du corpus |
| POST | `/knowledge/sources` | Créer une référence dans un arbre autorisé ou, avec habilitation, dans l’espace éditorial |
| GET | `/knowledge/sources/:id` | Fiche et historique autorisés ; jusqu’à 50 dernières entrées de chaque historique |
| PATCH | `/knowledge/sources/:id` | Remplacer les métadonnées avec révision attendue et motif |
| POST | `/knowledge/sources/:id/consultations` | Déclaration humaine sur la version courante, sans changement de validation scientifique |
| POST | `/knowledge/sources/:id/archive` | Archiver avec révision attendue et motif |

Un lecteur non habilité du futur corpus éditorial publié ne reçoit pas les brouillons de versions, consultations internes ou identifiants d’acteurs. Le service est exporté par `KnowledgeModule` pour les futures connexions aux trois modules ; leurs moteurs ne sont pas encore branchés à ce registre.

## Recette effectuée

- **Backend : 56 tests réussis**, dont contrôles de portée, permissions, DOI/URL, champs d’autorité refusés, conflits de versions, déclarations et archivage.
- **Frontend : 32 tests existants réussis**, lint et compilation réussis. La compilation backend est également réussie.
- **API et base locales réelles** : JWT, deux familles, rôle lecteur et retrait d’accès, conflit de DOI dans un même périmètre, réutilisation du DOI dans une autre famille, versions et anciens titres, consultation liée à sa version, archivage sans perte et contrainte empêchant une version d’une autre source.
- **Transaction réelle** : échec volontaire de l’écriture d’audit ; absence de source résiduelle confirmée après annulation.
- **Navigateur Chrome avec réponses API de recette** : formulaires, ajout, historique, contrôle d’accès ne déclarant pas une lecture, modification, archivage/filtre, rôle lecteur, affichage 320/390 pixels, absence d’appel au document distant et refus des écritures hors ligne.
- Les fixtures de l’intégration locale sont des comptes/arbres privés créés pour ce test, retirés par leurs identifiants exacts après la recette. Aucun rôle éditorial n’est attribué aux utilisateurs réels et aucune donnée familiale préexistante n’est supprimée.

Recette reproductible, depuis `griot-backend`, après migration et lancement de l’API locale :

```powershell
npm.cmd run build
npm.cmd test -- --runInBand
node scripts/check-knowledge-local.cjs http://localhost:3001/api
```

Le script refuse une API ou une base hébergées : il ne doit pas créer ces fixtures en production. La vérification de livraison utilise le compte de test existant en lecture, l’ouverture de l’onglet et les contrôles CI/Vercel ; les écritures détaillées sont recettées sur la base locale isolée.

## Limites et suites

- Les états autres que « à examiner » et « archivé » sont préparés pour la suite ; ce lot n’invente pas une procédure de validation scientifique.
- Pas d’extraction, de segments/pages, de copie de PDF, d’audio documentaire, de contrôle réseau automatique ni de tâche longue.
- Pas d’assertions, appuis, contradictions structurées, recherche sémantique ou RAG à partir de ces nouvelles sources.
- Pas d’attribution d’habilitation ni d’interface globale de curation ; le premier titulaire doit être explicitement désigné avant usage éditorial.
- Le registre demande du réseau et ne met pas les écritures documentaires dans la file de brouillons familiale. L’interface et l’API le signalent ; aucune synchronisation documentaire hors ligne n’est annoncée.
- Les histoires et cours actuels restent opérationnels sur leurs corpus précédents. Les ressources familiales ne sont ni publiées ni envoyées à un modèle externe.

La phase suivante structurera les passages et connaissances avec leur provenance, puis leur validation et leurs contradictions, avant l’activation de la recherche documentaire commune.
