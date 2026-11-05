# Origins, Language, Peoples & Civilizations — articulation des trois modules

**Proposition à valider, sans développement fonctionnel.** Ce document complète [Knowledge Core](../knowledge-core/README.md) à partir des trois cahiers des charges transmis le 5 novembre 2026 : [Origins](ORIGINS-CAHIER-DES-CHARGES.md), [Language](LANGUAGE-CAHIER-DES-CHARGES.md), [Peoples & Civilizations](PEOPLES-CAHIER-DES-CHARGES.md).

## 1. Répartition des responsabilités

| Composant | Responsabilité propre | Données partagées ou réutilisées |
| --- | --- | --- |
| Knowledge Core | Sources, consultations, versions, passages, assertions, contradictions, entités de référence, recherche et règles de citation | Une seule origine documentaire pour les trois modules |
| Origins | Contextualisation d’une famille, distinction faits/hypothèses/contexte, récits et enquêtes familiales | Personnes, relations, présences, souvenirs et preuves autorisés + références du Core |
| Language | Catalogue et découverte, contenus pédagogiques, exercices, progression personnelle, audio et activités familiales | Identifiants/variétés/ressources validées du Core + moteur pédagogique actuel |
| Peoples & Civilizations | Encyclopédie autonome, fiches, comparaisons, chronologies et découverte culturelle | Entités, relations, événements, périodes, territoires et sources du Core |
| GRIOT AI | Formulation, explication et conversation dans chaque contexte | Paquets documentaires autorisés, citations et limites fournis par le Core ; pas un registre parallèle |

Knowledge Core n’héberge ni les scores d’apprentissage ni une copie des généalogies. Les trois modules ne possèdent pas chacun leur moteur d’ingestion ou leur base de sources. La cartographie partage des composants de rendu et des formats de données, tout en gardant des couches et périmètres distincts.

## 2. Navigation et autonomie

La navigation principale proposera trois entrées lisibles : **Mes origines**, **Apprendre les langues**, **Peuples et civilisations**. Le socle documentaire reste un service transversal, avec un espace de curation réservé aux personnes habilitées.

- **Language** permet d’explorer un catalogue et de commencer un cours disponible sans arbre préalable. Un compte personnel peut conserver la progression ; un essai anonyme reste local. Les suggestions liées à une famille sont un enrichissement facultatif, pas un prérequis à l’apprentissage.
- **Peoples & Civilizations** fonctionne sans arbre et sans demander les origines de la personne. Les contenus publics peuvent être découverts avant connexion. Sauvegarder une découverte demande un compte ; la partager dans une famille demande un accès actif à l’arbre choisi.
- **Origins** utilise un arbre autorisé pour les récits personnels. Son exploration du contexte historique général peut réutiliser les contenus publics sans rendre l’arbre visible.
- Une consultation encyclopédique ne renseigne pas automatiquement une identité, une ascendance ou une langue maternelle dans l’arbre. Le passage d’une découverte publique au contexte familial est choisi par l’utilisateur et contrôlé côté serveur.

Écart actuel : les cours sont principalement montés dans `CultureSpace` ou une présentation publique et leur clé de progression inclut un arbre. Il n’existe pas encore de navigation générale indépendante pour ces trois modules, ni d’encyclopédie historique structurée. Une présentation publique fictive ne remplace pas cette autonomie.

## 3. GRIOT Origins

### Réutilisation et données manquantes

Réutiliser `Personne`, `RelationFamiliale`, `Migration`, `Lieu`, `Souvenir`, `Preuve`, le salon, `FamilyTreeView`, `OriginsJourney` et les fonctions de cohérence existantes. Une nationalité, une communauté culturelle ou une langue maternelle ne sont pas aujourd’hui des champs structurés dédiés de `Personne` : ne pas prétendre les exploiter tant qu’ils ne sont pas renseignés dans un modèle approuvé.

`villageOrigine` n’est pas automatiquement un lieu de naissance. Une étape `Migration` actuelle est une présence datée ou non ; elle ne précise pas si le lieu est naissance, résidence ou passage. Une extension ultérieure proposera cette qualification et sa précision géographique, avec preuve et provenance. Les anciennes étapes restent de type **présence non qualifiée** jusqu’à confirmation, sans conversion arbitraire.

Le moteur de contextualisation combine la période et les entités géographiques confirmées avec le Core. Les générations sont dérivées des liens de parenté utilisables, en conservant les données manquantes et les cycles éventuels comme limites. Un événement indirectement lié à une région n’est proposé que si cette relation est documentée ; un simple appariement de pays ne suffit pas à conclure.

### Trois niveaux obligatoires dans les réponses

| Niveau | Présentation | Condition |
| --- | --- | --- |
| A — Parcours familial documenté | Présences, liens et déplacements attestés avec leurs pièces ou leur statut familial | Ne restituer que ce qui est enregistré et autorisé ; deux présences ne donnent pas automatiquement une date de départ ou un itinéraire |
| B — Hypothèses pour la famille | Explications possibles, éléments favorables, limites et questions d’enquête | Contexte documentaire pertinent, formulation conditionnelle et motif individuel non établi ; aucune probabilité arbitraire |
| C — Mouvements et contexte généraux | Événements ou mouvements collectifs de la région/période | Sources du Core ; l’absence de lien individuel est explicite |

L’exemple « Allemagne, naissance en 1905, installation en France en 1930 » ne peut pas être expliqué comme une fuite après un événement survenu ultérieurement. Une chronologie empêche de transformer des événements postérieurs en causes de ce départ ; ils peuvent figurer ensuite comme contexte de la vie en France si pertinent et sourcé. Une participation à une guerre ou une persécution personnelle exige un appui individuel.

### Récits, cartes et enquête

Un récit est un objet métier versionné dans Origins, avec l’arbre, les personnes autorisées, le niveau A/B/C de chaque bloc, les révisions de connaissances citées, le moteur utilisé, la date et les retours humains. Il ne remplace pas les preuves et ne rejoint pas le corpus public. Sa structure couvre naissance connue, période, événements, mouvements, hypothèses, conséquences documentées et questions à la famille ; les rubriques non documentées sont signalées plutôt qu’inventées.

Deux représentations sont séparées : **carte des présences familiales** et **carte des mouvements historiques collectifs**. Elles peuvent partager une légende et une période sélectionnée, mais jamais une polyligne laissant croire qu’une route collective est celle d’un ancêtre. Coordonnées approximatives, dates imprécises et frontières disputées sont visibles. La chronologie relie générations et événements en distinguant dates certaines, intervalles et lacunes.

Les questions d’enquête proposent d’ajouter un témoignage ou un document dans le système familial existant. L’origine de la réponse, son consentement, sa date, les désaccords et les versions du récit sont conservés. Aucune invitation ou publication n’est envoyée automatiquement.

## 4. GRIOT Language

### Catalogue, suggestions et prise en charge réelle

Réutiliser les identifiants Glottolog/ISO disponibles, les initiations fang/anglais/allemand/espagnol/mandarin, `LanguageWorkshop`, `languageTutor`, les voix contrôlées et le salon familial. Une fiche de langue provient des entités et ressources du Core : noms et variantes, famille linguistique, graphies, phonétique documentée, localités/périodes, références et état de validation.

Aujourd’hui les suggestions utilisent surtout les pays des présences, un catalogue géographique Glottolog et une liste pratique de quatre langues internationales. Elles ne sont pas un moteur historique régional/villageois. Le futur affinage local nécessite des relations géographiques **sourcées et datées** ; en leur absence, la proposition reste au niveau documenté et l’utilisateur peut préciser ou choisir librement.

La suggestion indique sa justification et sa portée : « langue documentée dans cette région à cette période », « langue déclarée dans la famille », ou « langue pratique proposée pour un pays ». L’utilisateur confirme ; ni le pays ni la dernière présence ne prouvent la langue maternelle. Les variantes et systèmes d’écriture sont explicitement sélectionnables lorsqu’ils sont documentés.

Toute langue peut être sélectionnée dans le catalogue, indépendamment des origines. La disponibilité pédagogique reste honnête : **catalogue seul**, **documentation limitée**, **initiation disponible**, **parcours partiel** ou **parcours relu disponible**. Une langue sans leçons n’ouvre pas un faux cours produit par génération automatique.

### Parcours et progrès

Le module Language possède les objets métier pédagogiques : cours/version, unités, objectifs, compétences, exercices, réponses acceptées documentées et explications. Les contenus/règles linguistiques et voix sont référencés dans le Core ; la mise en scène pédagogique et la progression ne sont pas copiées dans le registre de faits.

Les paliers débutant/intermédiaire/avancé sont des objectifs de couverture à construire langue par langue. Les cinq initiations actuelles ne sont pas présentées comme ces trois niveaux achevés. L’alphabet ou la conjugaison ne sont pas imposés si ces notions ne correspondent pas au fonctionnement de la langue concernée.

Réutiliser les choix, la pratique écrite et la répétition espacée ; ajouter ensuite les activités de sons, écoute, complétion, dictée, assemblage et dialogue selon les ressources validées. Les réponses alternatives portent langue/variété/graphie et justification. Ne pas effacer les tons pour accepter indistinctement des mots différents ; ne pas rejeter une variante correcte parce qu’elle n’est pas la forme initiale du cours.

L’apprentissage sans arbre nécessite une progression personnelle liée au compte et à la version du cours, indépendante de l’appartenance familiale. Les contextes et défis d’arbre y font référence avec partage volontaire des résultats. Pour les anciennes progressions IndexedDB par arbre : maintien du parcours existant et reprise explicite, sans fusion silencieuse des points, réponses ou dates de révision. Une synchronisation éventuelle vers le serveur exige une conception de reprise hors ligne et des conflits, à présenter avant mise en œuvre.

### Audio, professeur et contributions

L’audio conserve la variété, le locuteur ou son pseudonyme choisi, l’accord, les usages permis, la source et l’état de relecture. Distinguer une voix humaine validée, une synthèse disponible sur l’appareil et une synthèse dont l’adéquation n’est pas évaluée. La reconnaissance et la notation orales ne sont activées pour une langue qu’après démonstration de leur qualité ; la présence d’une API navigateur ne suffit pas.

Le professeur explique à partir de ressources validées. Les dialogues simulés sont limités aux formes et règles réellement documentées ; aucun mot, ton, règle ou traduction n’est inventé pour donner l’impression d’une conversation complète. Les exercices sans ressources audio fiables restent accessibles sous une autre forme, avec leur limite indiquée.

Les contributions familiales, variantes locales et formes de référence restent distinctes. Une fiche validée par un responsable familial peut servir dans son espace actuel selon les droits existants ; sa promotion en cours de référence demande une relecture linguistique et des droits adaptés. Défis, groupes, badges et partage des progrès sont des fonctions Language/Collaboration, pas des prétextes pour exposer les essais personnels ou les voix privées.

## 5. GRIOT Peoples & Civilizations

### Catalogue autonome et couverture

Créer un catalogue public indépendant de l’arbre avec catégories géographiques et chronologiques, recherche, fiches, carte, frises et comparaisons. Les peuples contemporains, civilisations historiques, groupes linguistiques et entités politiques sont des types distincts. Une civilisation peut contenir plusieurs communautés ; un ensemble ethnolinguistique ne devient pas un empire par souci d’uniformité d’interface.

Le catalogue vise toutes les régions du monde. Le premier lot est un **corpus pilote réellement documenté**, avec périmètre et manques affichés ; aucun nombre de fiches ni couverture mondiale ne sont obtenus par remplissage fictif. Les exemples Afrique, Europe, Asie, Amériques et Océanie du cahier des charges forment une feuille de couverture, pas une liste de contenus déjà vérifiés. Le choix du pilote et les ressources autorisées sont à valider après l’inventaire documentaire.

### Fiches, hypothèses et comparaisons

Chaque fiche assemble des assertions du Core : noms et appellations contextualisés, régions/périodes, formation ou hypothèses, organisation politique/sociale, économie, langues, religions documentées, traditions, arts, techniques, relations et héritages. Une rubrique inconnue reste signalée ; elle ne se remplit pas avec une supposition générale sur la région.

Les migrations collectives distinguent appuis historiques, archéologiques, linguistiques, génétiques et oraux. Une étude génétique générale ne renseigne pas l’ascendance d’un utilisateur ; ce projet ne prévoit ni import de tests ADN personnels ni inférence d’identité individuelle. Les traditions orales sont contextualisées, attribuées et présentées avec leurs variantes, sans disqualification automatique ni conversion en événement établi.

Les comparaisons choisissent un contexte temporel et des axes communs (territoire, organisation, langues, échanges, héritages). Elles présentent sources, incertitudes et champs non comparables. Pas de classement de supériorité ni de symétrie artificielle entre un peuple actuel et une entité politique antique. Les désaccords et les méthodes sont visibles.

### Cartes, médias et passerelles

Les géométries historiques sont des ressources sourcées/versionnées, avec périodes, échelle, précision et variantes disputées. Le fond mondial actuel peut servir de repère explicitement marqué ; il ne dessine pas automatiquement les frontières d’un ancien royaume. Les anciennes capitales, routes commerciales et zones culturelles sont des objets distincts avec leurs propres preuves.

Une photographie d’archive, une photographie d’objet, une carte ancienne, un dessin pédagogique et une reconstitution générée sont identifiés comme tels. Un rendu généré ne devient jamais une photographie authentique d’ancêtre ou d’événement. Les droits de l’image sont indépendants de la présence d’une source textuelle décrivant le même sujet.

Les liens vers Language citent une association peuple/langue documentée, sans exclusivité implicite, puis indiquent si un cours existe. Les liens vers Origins proposent une exploration choisie des territoires familiaux ; aucune appartenance n’est déduite de la consultation d’une fiche. Sauvegarde et partage utilisent des références/version/visibilité, pas une copie publique d’une conversation privée.

## 6. Contrats de données à définir avant codage

| Contrat logique proposé | Entrée | Sortie et limite |
| --- | --- | --- |
| Recherche documentaire du Core | Question, module, filtres ; droits résolus au serveur | Révisions/passages/citations autorisés, couverture et incertitudes |
| Contextualisation Origins | Arbre et personnes autorisés, dates et lieux confirmés | Blocs A/B/C, périodes et citations ; aucune cause personnelle présumée |
| Suggestion Language | Entités géographiques/linguistiques déclarées, période facultative | Propositions avec justification et niveau géographique réel, statut du cours |
| Catalogue Language | Langue/variété, sans arbre obligatoire | Fiche et ressources disponibles, limites, cours/version et capacités audio |
| Fiche Peoples | Entité et période | Assertions/citations par rubrique, relations et types d’entité explicites |
| Carte historique | Période, zone et types d’objets | Géométries sourcées, précision et versions ; aucune donnée familiale sans accès |
| Comparaison | Entités, période et axes | Rubriques comparables, absences, désaccords et références |

Ces contrats sont conceptuels, pas des endpoints annoncés comme disponibles. Les DTO, chemins API et contraintes physiques seront présentés à la phase de conception concernée. L’utilisateur ne fournit jamais ses propres droits d’accès dans ces entrées.

## 7. Ordre d’intégration et dépendances

Les progressions locales, les arbres, les exemples publics persistants et les fonctions hors ligne continuent de fonctionner pendant la construction du socle. Le registre documentaire puis les passages/citations communs précèdent l’activation de nouveaux récits ou réponses génératives. Un catalogue de découverte en lecture peut être livré avant un professeur conversationnel complet, à condition d’afficher la disponibilité réelle des contenus.

1. Valider l’audit et l’architecture commune ; conserver les quatre cahiers des charges.
2. Développer les sources, droits, versions, consultations et validation du Core.
3. Construire les entités, assertions et passages d’un corpus pilote, puis la recherche/citation commune.
4. Intégrer les blocs A/B/C d’Origins et les références/suggestions Language sans perte de données.
5. Donner à Language sa découverte et ses cours indépendants de l’arbre ; enrichir prioritairement le fang avec relecture et voix documentées.
6. Développer le catalogue autonome Peoples & Civilizations sur le même Core, puis fiches, frises, cartes et comparaisons.
7. Ajouter professeur et assistant documentaires avancés, activités familiales et packs hors ligne au rythme des contenus et capacités réellement validés.

Les phases propres à chaque cahier des charges sont conservées dans le [plan de réalisation](../knowledge-core/REALISATION-ET-RECETTE.md). Les dépendances peuvent se recouvrir ; elles ne justifient pas de déclarer un module achevé dès que son interface existe.
