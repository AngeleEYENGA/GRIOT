# Réalisation, validation et recette — Knowledge Core et modules

**Plan proposé, non exécuté.** L’audit et le dossier de conception sont les livrables de cette étape. La validation de l’architecture est requise avant toute migration ou développement. Chaque phase aura un rapport séparant réalisé, tests effectivement exécutés, limites et suite proposée.

## 1. Phases Knowledge Core

| Phase de la demande | Modifications prévues | Dépendances et décision d’entrée | Preuve de sortie attendue |
| --- | --- | --- | --- |
| K1 — Audit | Inventaire du code, des modèles et de la base locale, écarts et réutilisation | Accès au dépôt et inventaire local en lecture seule | [AUDIT.md](AUDIT.md), avec périmètre et limites ; réalisé pour ce dossier |
| K2 — Modèle commun | Modèle conceptuel, droits, versionnement, contrats et index envisagés | Audit ; validation de l’architecture avant codage | [ARCHITECTURE.md](ARCHITECTURE.md) et [articulation des modules](../modules/ARCHITECTURE-PARTAGEE.md), proposés dans ce dossier ; schéma physique à préciser après accord |
| K3 — Gestion des sources | Enrichir `Source`, consultations, versions, droits, habilitations, journal et opérations sur métadonnées | Architecture validée, périmètre de reprise des anciennes sources, premiers curateurs désignés ; migrations additives présentées avant exécution | Source identifiée sans fausse consultation ; contrôle d’accès et journal d’une modification ; doublon expliqué |
| K4 — Structuration | Segments/ancrages, connaissances/révisions, appuis, contradictions, entités/thèmes, propositions modérées | Sources et usages autorisés ; corpus pilote choisi ; traitement long borné défini | Une assertion reliée à un passage versionné ; désaccord et provenance conservés ; proposition privée hors corpus public |
| K5 — Recherche et RAG | Recherche textuelle/filtres, évaluation sémantique, sélection de passages et paquet documentaire ; génération désactivée par défaut | Corpus relu, jeu d’évaluation, accès/quotas vérifiés ; choix du composant sémantique et fournisseur éventuel présentés avant intégration | Mesures sur corpus annoté, limites linguistiques, recherche en périmètre ; recherche lexicale seule déclarée partielle |
| K6 — Citations et validation | Citations par assertion, contrôle des références, états de réponse, décisions éditoriales et abstention | Passages et versions ; relecture humaine ; conditions de génération approuvées si nécessaire | Zéro référence hors paquet, références ouvrables avec droits, absence de réponse non appuyée dans les cas de recette |
| K7 — Connexion progressive | Adaptateurs Origins, Language et Peoples, intégration GRIOT AI, distributions versionnées et transition des anciens corpus | Contrats/citations validés, corpus compatible avec chaque usage ; activation progressive et stratégie de repli | Les trois usages retrouvent la même source/version ; aucune duplication éditoriale ni régression des parcours existants |
| K8 — Recette et documentation | Tests transversaux, accès, coûts, charge, reprise des tâches, sauvegarde/restauration et rapport opérationnel | Phases précédentes intégrées ; environnements et budget de recette explicitement définis | Rapport des douze critères ci-dessous, limites réelles et fonctionnalités encore indisponibles |

Les tests d’accès, de provenance et de migration sont réalisés dès les phases concernées ; K8 est une consolidation, pas le premier contrôle de sécurité. Le RAG et les contenus nouvellement générés ne deviennent visibles que lorsque citations et règles de validation sont effectivement en place.

## 2. Phases propres aux modules

La numérotation ci-dessous conserve les cahiers des charges ; elle ne remplace pas les dépendances Knowledge Core.

| Module | Phases prévues, dans leur ordre | Dépendance structurante |
| --- | --- | --- |
| Origins | O1 audit/architecture ; O2 modèles/documentation ; O3 contextualisation ; O4 récit ; O5 cartes/frise ; O6 intégration familiale/interface ; O7 recette | Recherche, périodes, entités et citations du Core avant l’activation de récits documentaires ; les données familiales restent dans leur périmètre |
| Language | L1 audit ; L2 catalogue/référentiel ; L3 suggestions ; L4 parcours ; L5 exercices/progression ; L6 audio/IA ; L7 collaboration/contributions ; L8 recette | Identifiants, variantes et ressources du Core ; conception de l’accès sans arbre et de la reprise des progrès ; relecture linguistique avant cours de référence |
| Peoples & Civilizations | P1 audit/conception ; P2 référentiel ; P3 système documentaire ; P4 fiches ; P5 cartes/frises ; P6 assistant ; P7 comparaisons/thèmes ; P8 passerelles ; P9 recette | Catalogue public autonome ; entités/territoires historiques et appuis du Core ; sélection de contenus réels avec couverture et manques affichés |

Avant chaque phase : présenter périmètre, composants réutilisés, tables/contrats concernés, droits, migrations éventuelles, dépendances de contenu et d’hébergement, effets attendus et recette. Les fonctions optionnelles ou non prises en charge restent visibles comme limites, jamais comme simulations de service.

## 3. Reprise et premier corpus

1. Créer un inventaire des références actuelles, avec leur fichier d’origine, identifiants locaux et état de preuve. Conserver les dates d’import des jeux GeoNames/Glottolog comme métadonnées déclarées, sans les transformer en décisions de validation.
2. Examiner les droits et vérifier les documents du corpus pilote réellement accessibles. Une référence identifiée, un résultat de recherche ou une page d’accueil ne suffisent pas à marquer l’ouvrage consulté.
3. Pour un petit ensemble autorisé, créer sources/versions/passages et assertions relues. Choisir les langues et thèmes en fonction de ressources effectivement documentées ; le fang reste la priorité pédagogique donnée par la responsable.
4. Inclure un jeu d’origines et un sujet de découverte culturelle réels sans inventer un catalogue mondial. Les quatre arbres publics fictifs restent des données de **recette familiale**, pas des faits historiques ni des contenus encyclopédiques de référence.
5. Faire consommer ces mêmes sources par les trois adaptateurs et vérifier leurs réponses. Ne pas recopier les textes sous trois jeux d’identifiants.

Le corpus pilote, sa taille, ses relecteurs et les droits de ses contenus sont à arrêter avant l’ingestion. Les sources suggérées dans les prompts (archives, UNESCO, Glottolog, publications universitaires, institutions et locuteurs) sont des pistes à examiner, pas des intégrations disponibles ou des contenus libres de droits par défaut.

## 4. Couverture des douze critères Knowledge Core

| Critère | Cas de recette et preuve attendue |
| --- | --- |
| KC-01 — Référentiel partagé | Origins, Language et Peoples renvoient le même ID de source et la même version pour une connaissance commune ; aucun registre parallèle |
| KC-02 — Centralisation/déduplication | Même DOI/document proposé deux fois dans un périmètre : un rapprochement contrôlé, historique et alias conservés ; édition distincte et document privé d’un autre arbre non fusionnés silencieusement |
| KC-03 — Provenance | HEAD accessible reste un contrôle d’accès, pas une lecture ; une assertion importée sans passage ne devient pas vérifiée ; page/section/timecode relié à la bonne version |
| KC-04 — Citations | Référence inventée ou extérieure au paquet rejetée ; chaque assertion justifiée a une citation pertinente, ouvrable, datée/versionnée quand disponible et sans accès privé indu |
| KC-05 — Faits/hypothèses | Dans le cas Éthiopie–Cameroun, aucune cause personnelle n’est affirmée à partir du contexte national ; les qualifications sont affichées par bloc |
| KC-06 — Contradictions | Deux thèses incompatibles sur le même objet/période sont conservées avec arguments ; deux copies dépendantes ne deviennent pas deux confirmations indépendantes |
| KC-07 — Ressources linguistiques | Une ressource/variante et ses sources sont utilisées par Language et une fiche Peoples sans double corpus ; absence d’audio ou de cours annoncée honnêtement |
| KC-08 — Contributions autorisées | Contribution proposée, attribuée, modérée puis éventuellement relue ; membre non autorisé bloqué, éditeur familial sans pouvoir implicite de publication scientifique globale |
| KC-09 — Versions/mises à jour | Document modifié/indisponible, ancienne réponse encore liée à sa version, nouvelle relecture et invalidation ciblée ; source retirée non réintroduite par cache |
| KC-10 — Droits | Arbres A/B, membre suspendu ou retiré, citation directe et cache déjà chaud : aucune fuite de contenu, titre ou extrait ; documents importés hostiles sans effet sur permissions/outils |
| KC-11 — Performance/coûts | Pagination et budgets respectés, import volumineux asynchrone, bail interrompu/repris sans doublon, plafond d’appels externe appliqué et mesures consignées |
| KC-12 — Non-régression | Arbres, liens familiaux, cartes, cours/progrès, comptes, rôles, présentations publiques, médias, rapports et fonctionnement hors ligne toujours utilisables |

## 5. Couverture Origins

| Critère du prompt | Cas de recette |
| --- | --- |
| O-01 — Arbre existant | Lire personnes/relations autorisées sans exiger une nouvelle saisie ou une copie du même arbre |
| O-02 — Générations et époque | Dates/générations partielles et incohérentes signalées ; village d’origine non converti en naissance par défaut |
| O-03 — Événements pertinents | Filtrer sur territoire et période, qualifier un effet indirect et citer son appui ; pas de contexte national appliqué aveuglément |
| O-04 — Individuel/collectif | Réponse structurée A/B/C et styles cartographiques distincts ; aucune route collective attribuée à la famille |
| O-05 — Hypothèses | Allemagne 1905 / France 1930 : pas de cause survenue après le départ ; pistes conditionnelles et limites ; aucune persécution ou participation militaire inventée |
| O-06 — Récits sourcés | Chaque bloc garde son origine familiale ou documentaire, sa version et ses citations ; approfondissement sans fabriquer d’archive |
| O-07 — Deux cartes | Présences personnelles séparées des mouvements généraux ; localisation approximative visible ; pas d’itinéraire précis supposé |
| O-08 — Chronologie | Frise de générations/événements avec intervalles, dates manquantes et bornes approximatives |
| O-09 — Enquête | Question adaptée au manque réel ; réponse familiale rattachée à auteur/date et pièce éventuelle |
| O-10 — Collaboration | Partage, témoignage, document et contestation selon le rôle actif ; versions du récit conservées |
| O-11 — Incertitudes | Les traces incomplètes et deux sources divergentes restent ambiguës ; aucun ordre artificiel des présences simultanées |
| O-12 — Compatibilité | Quatre arbres persistants, filtres individuels et liaisons cartographiques de référence 3/4/1/5 maintenus ; aucun exemple fictif présenté comme une enquête réelle |

## 6. Couverture Language

| Critère du prompt | Cas de recette |
| --- | --- |
| L-01 — Suggestions géographiques | Toutes les branches, puis précision région/village seulement si documentée ; dernière présence non présentée comme résidence actuelle certaine |
| L-02 — Pas de déduction abusive | Plusieurs langues dans une ville et une langue dans plusieurs pays ; confirmation familiale et choix libre, aucune attribution maternelle automatique |
| L-03 — Catalogue structuré | Alias, codes, famille, variété/graphie, territoires/périodes, provenance et documentation ; informations absentes explicites |
| L-04 — Sélection autonome | Accéder au catalogue et à un cours réellement disponible sans créer d’arbre ni appartenir à une famille |
| L-05 — Parcours | Objectifs et unités versionnés par langue ; les initiations actuelles ne sont pas affichées comme trois niveaux complets |
| L-06 — Exercices | Correction expliquée ; plusieurs réponses recevables documentées ; variantes correctes admises, tons pertinents conservés |
| L-07 — Progrès | Reprise après fermeture/coupure, révisions dues, absence de double crédit, ancienne progression par arbre conservée ou reprise explicitement |
| L-08 — Professeur | Réponse sourcée ou manque indiqué ; pas de règle/mot/traduction inventés ; dialogue limité aux ressources validées |
| L-09 — Voix | Modèle humain validé ou synthèse identifiée ; absence de voix, refus du micro et indisponibilité ASR sans fausse note de prononciation |
| L-10 — Famille | Défi/groupe et partage de progrès volontaire, droits vérifiés ; essai personnel non partagé par défaut |
| L-11 — Contributions | Locuteur/pseudonyme, date, localité/variété et consentement conservés ; correction et retrait tracés |
| L-12 — Validation | Proposition non relue hors cours de référence ; validation familiale distinguée de la relecture linguistique et des droits de diffusion |
| L-13 — Extensibilité | Ajouter une langue/variante et ses ressources via le modèle approuvé sans refonte ; statut catalogue seul si ressources insuffisantes |
| L-14 — Compatibilité | Fang et quatre initiations diaspora, carnets privés, voix et objectifs existants maintenus ; aucune voix synthétique dans une autre langue en remplacement silencieux |

## 7. Couverture Peoples & Civilizations

| Critère du prompt | Cas de recette |
| --- | --- |
| P-01 — Découverte mondiale | Navigation autonome par région/période ; couverture et manques du corpus affichés, pas de remplissage fictif |
| P-02 — Fiches détaillées | Rubriques structurées et assertions sourcées ; peuple contemporain, civilisation et entité politique non confondus |
| P-03 — Origines/migrations | Appuis archéologiques, génétiques, linguistiques, historiques et oraux distingués ; aucune ascendance personnelle déduite |
| P-04 — Frises | Époques anciennes, avant notre ère, intervalles et dates incertaines représentés correctement |
| P-05 — Territoires | Carte historique choisie pour la période, limites approximatives/disputées et sources visibles ; fond actuel seulement comme repère |
| P-06 — Assistant | Question de découverte sans arbre, approfondissement et réponse justifiée ou abstention documentaire |
| P-07 — Sources | Références proches des assertions et accès/licences respectés ; une institution reconnue n’implique pas neutralité automatique |
| P-08 — Traditions orales | Plusieurs récits attribués/contextualisés, ni disqualifiés automatiquement ni transformés en certitudes |
| P-09 — Comparaison | Axes et période explicites, données manquantes et objets non comparables signalés ; pas de classement de supériorité |
| P-10 — Langues | Relation documentée non exclusive et passage vers la fiche/variété ; disponibilité réelle du cours annoncée |
| P-11 — Passerelle familiale | Contexte familial ouvert volontairement avec contrôle d’accès, aucune identité enregistrée après simple lecture d’une fiche |
| P-12 — Sauvegarde/partage | Favori personnel et partage familial autorisé avec référence/version ; aucune conversation ou pièce privée publiée automatiquement |
| P-13 — Qualification | Faits, hypothèses, méthodes et traditions distincts ; illustrations générées/reconstitutions jamais présentées comme archives authentiques |
| P-14 — Compatibilité | Navigation actuelle, données, rôles, apprentissage, hors ligne et présentations publiques conservés |

## 8. Mesures et qualité : objectifs à établir avant activation

Constituer un jeu de questions annotées par module et langue, avec passages attendus, questions sans réponse, contradictions, homonymes, périodes approximatives et tentatives de sortie de périmètre. Inclure du français, du fang et les autres langues dont la prise en charge est annoncée. Si une langue ne dispose pas d’un jeu fiable ou de relecteur, ne pas déclarer sa qualité sémantique démontrée.

Mesurer rappel/pertinence des passages, exactitude des citations et soutien réel aux assertions, taux d’abstention appropriée, erreurs de causalité et de portée, latence P50/P95, temps d’import, taille des index/caches, coût par recherche/encodage et reprises après interruption. La recette des droits exige zéro fuite dans le jeu de cas ; un bon score moyen ne compense pas une fuite.

Les seuils de qualité et latence, le volume de charge, les plafonds d’appels/tokens, les frais autorisés et les durées de conservation sont des décisions d’entrée de K5/K8. Aucun coût ou performance de production n’a été mesuré dans ce dossier. Ne pas remplacer cette mesure par une promesse ou une note de fiabilité calculée arbitrairement.

Prévoir des tests unitaires des règles, des tests d’intégration sur une base de recette, des tests d’accès multi-utilisateurs et des essais navigateur/appareil pour cartes, audio et hors-ligne. Les voix/microphones réels, contenus et relectures humaines nécessitent leurs validations propres ; des mocks ne suffisent pas à les déclarer opérationnels.

## 9. Format du rapport de chaque phase

- Objectif et architecture de référence validée ; modifications prévues présentées avant exécution.
- Fonctions réellement opérationnelles, périmètre de contenus/langues et API éventuellement livrées.
- Migrations, données reprises, droits, dépendances et versions.
- Tests effectivement exécutés : environnement, données fictives de recette, résultats, limites et liens de preuve.
- Recherche effectuée, documents réellement consultés, usages permis et sources encore à examiner.
- Performance/coûts mesurés ou non mesurés, erreurs et actions restantes.
- Limites, prochaines phases et décisions requises ; aucune partie simulée déclarée terminée.

## 10. État à la remise de ce dossier

Audit du code et inventaire local en lecture seule réalisés. Architecture, contrats des modules et recette proposés. Les quatre cahiers des charges sont conservés. Les nouvelles sources, tables, interfaces, index, traitements asynchrones et intégrations de modèles restent **à développer après validation**. Aucun nouveau service n’est activé, aucun contenu protégé ingéré, aucune permission familiale changée.
