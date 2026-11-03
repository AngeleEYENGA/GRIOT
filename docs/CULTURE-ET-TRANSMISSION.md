# Le cercle familial de GRIOT

Le cercle ajoute trois espaces à chaque arbre : le salon privé, l’atelier de langues et la lecture historique des parcours. Il est accessible dans le menu latéral, dans « Autres rubriques » et depuis le tableau de bord. Le guide explique son fonctionnement.

## Salon

Messages par thème (discussion, langue, conte, cuisine, tradition, migration), réponses à un niveau et pagination de 30 messages. Un message peut être supprimé par son auteur, un administrateur ou un éditeur ; la suppression d’un fil supprime ses réponses. Actualisation manuelle : aucun WebSocket, messagerie instantanée ou notification de présence n’est annoncé. Les publications sont des contributions familiales, pas des faits automatiquement vérifiés. Les enfants utilisent cet espace accompagnés ; aucun compte enfant ni profil d’âge n’a été ajouté.

## Langues et apprentissage

Les pays explicitement renseignés dans les parcours suggèrent les langues associées dans Glottolog 5.3. Le pays, le nom d’une personne, son lieu de naissance ou son nom de famille ne permettent pas de déterminer sa langue natale ou son identité culturelle. La famille choisit la langue et peut indiquer une variante absente du catalogue.

Catalogue : Hammarström, Harald; Forkel, Robert; Haspelmath, Martin; Bank, Sebastian. Glottolog 5.3, Max Planck Institute for Evolutionary Anthropology. Données CLDF sous CC BY 4.0 : https://github.com/glottolog/glottolog-cldf. `languages-source.json` conserve la provenance, le nombre de lignes et le hash du CSV source ; `languages.json` ne conserve que les entrées de niveau « language » avec un pays renseigné. Les noms du catalogue ne sont pas tous traduits en français. Le catalogue couvre les langues, pas des cours, alphabets ou fichiers audio.

Les proches créent des fiches de mots/expressions, de lettres/signes/syllabes et d’exemples grammaticaux. Chaque fiche contient une traduction, une source ou un locuteur et, facultativement, une explication de la variante et une prononciation. Toutes commencent « à relire ». Les administrateurs/éditeurs valident la relecture familiale ; celle-ci n’est pas une certification linguistique. Seules les fiches relues entrent dans les jeux. Il n’y a pas de génération automatique de traductions ni de cours complets préchargés.

Deux approches : découverte par choix/écoute et pratique par saisie. Les accents et tons sont conservés dans la correction. La progression (fiches retrouvées sans consulter la réponse) est personnelle, stockée dans IndexedDB par compte et arbre, et effacée à la déconnexion. Elle ne représente pas un niveau de maîtrise certifié. Les défis sont des messages préparés dans le salon ; un clic explicite sur Publier est nécessaire.

Les enregistrements demandent explicitement le micro, durent au plus 15 secondes et sont envoyés à l’arrêt. L’import accepte les audios MP3/M4A/OGG/WAV/WebM de 512 Kio au plus. Un nouveau fichier remet la fiche à relire. Les octets sont stockés en PostgreSQL, séparés de la réponse listant les fiches ; ce choix convient à de courtes voix, pas à une médiathèque longue. Le serveur contrôle les signatures des conteneurs et le type déclaré. L’écoute passe par une route authentifiée, liée à l’arbre, `private, no-store`, et n’expose pas d’URL publique. Les pistes du micro s’arrêtent à la sortie du composant.

## Professeur virtuel de fang : apprendre sans contribution familiale

L’onglet est désormais nommé **Mes parcours de langues**. Il inclut également quatre initiations en anglais, allemand, espagnol et chinois mandarin (`src/data/worldCourses.js`), chacune avec trois étapes et neuf éléments. Les consignes et questions sont rédigées pour GRIOT, avec les références liées aux leçons. Il ne s’agit pas d’un cursus complet ni d’un générateur de cours pour toutes les langues du catalogue.

`src/utils/languagePlan.js` parcourt tous les pays reconnus dans les présences de chaque personne. Un répertoire pratique restreint rapproche certains pays des quatre langues internationales disponibles ; ce n’est ni un inventaire exhaustif des langues du pays, ni un classificateur d’identité. Les choix familiaux sont rapprochés par ISO ou identifiant Glottolog. La dernière date est calculée par personne, les pays contradictoires à cette date sont signalés et les étapes sans date ne la remplacent pas. L’interface parle de dernière présence datée, jamais de résidence actuelle certaine. L’atelier conserve parallèlement les suggestions Glottolog pour toutes les langues concernées géographiquement.

Le moteur de progression accepte un cours explicite, avec le fang comme valeur par défaut pour préserver les progressions existantes. La clé IndexedDB contient utilisateur, arbre et identifiant du cours. La restauration exclut les identifiants des autres cours ; exercices, déblocages, points et révisions ne se mélangent pas. Les démonstrations publiques utilisent un périmètre local distinct, sans écriture API, avec remise à zéro par cours.

`SynthPronunciation.jsx` ne propose l’écoute que pour une voix correspondant exactement à la locale du cours. Les quatre cours utilisent en-GB, de-DE, es-ES et zh-CN ; aucune voix française, ni cantonaise pour le mandarin, n’est substituée. Le moteur annule sa lecture à la sortie. Une voix peut demander Internet : seul l’entraînement textuel est garanti sans ce service. Les essais de microphone restent locaux ; aucune reconnaissance ou notation orale n’est ajoutée.

Un parcours autonome, distinct des fiches proposées par les proches, est embarqué dans `src/data/fangCourse.js`. Il comporte quatre étapes et treize éléments d’initiation au fang-ntumu. Les textes, exercices, explications et sources sont disponibles sans qu’un membre de l’arbre parle la langue. Le catalogue Glottolog n’est pas utilisé pour inventer ce contenu.

Le moteur `languageTutor.js` ordonne les exercices selon les erreurs et les révisions dues. Une erreur ou une réponse avec aide remet l’intervalle à cinq minutes. Une réponse sans aide augmente le stade de révision (un, trois, sept, quatorze jours). Le même élément est crédité une seule fois par jour ; la journée de suivi utilise le fuseau Europe/Paris. Une étape se débloque lorsque chaque élément précédent a été retrouvé sans aide au moins une fois. Ce critère concerne les exercices du cours et n’atteste pas une compétence orale.

Les explications du coach sont une recherche guidée dans ce cours, complétée de conseils déterministes. Aucun modèle de langue externe ni service de traduction n’est appelé. Les demandes de traduction libre reçoivent une indication du périmètre ; un contenu inconnu n’est pas fabriqué. La correction écrite conserve les signes diacritiques ; le clavier propose les caractères utiles.

La progression utilise IndexedDB avec une clé incluant utilisateur, arbre et version du parcours. Le chargement normalise les données et ignore les identifiants inconnus. Les réponses, dates et scores restent sur cet appareil ; ils sont effacés par le mécanisme de déconnexion existant. La vidéo externe n’est pas mise en cache. Aucun schéma de base ni service d’IA payant n’est requis pour ce parcours.

La démonstration orale de « Mbóló » est liée à la publication de Dzaleu ; le lecteur YouTube en mode de confidentialité avancée est chargé seulement sur action explicite. Une alternative permet d’ouvrir la vidéo chez son créateur. Elle concerne cette salutation, pas toutes les formes du cours. Pour les autres éléments, l’absence d’audio vérifié est affichée. Le composant `SelfPronunciation` enregistre au plus dix secondes, arrête les pistes à la sortie, ne téléverse rien et révoque les URL temporaires. Il permet l’auto-écoute, pas une mesure automatique de la justesse. La qualité pédagogique des voix et les microphones physiques doivent encore être vérifiés avec des appareils et locuteurs réels.

Sources : LGIDF/CNRS, Ondo Obame et Zribi-Hertz (2021), fiche « Le fang-ntoumou » ; Pamphile Mebiame-Akono, Université Omar Bongo, « Les rituels communicatifs des Fang-Ntumu », p. 192 ; Dzaleu, démonstration de « Mbóló ». Les transcriptions des sources sont conservées ; ce sont parfois des formes phonétiques savantes et non une orthographe unifiée. Les règles d’entraînement et consignes de GRIOT sont rédigées séparément. Toute extension doit conserver la variété, la provenance et le statut audio de chaque élément.

Tests spécifiques : démarrage sans fiche familiale, priorisation des erreurs, intervalles de répétition, crédits quotidiens, progression avec/sans aide, déblocage, respect des tons, restauration des données et changement d’heure. Le parcours navigateur vérifie aussi le lecteur non chargé sans clic, le refus du micro, l’absence d’envoi de voix, le mode lecteur et la pratique hors réseau.

## Notions culturelles et explications illustrées

`griot-backend/src/ai/cultural-knowledge.ts` contient un premier corpus de définitions et références pour ethnie, tribu, clan et lignage, un exemple de rapprochement entre langues Fang/Ewondo/Bulu et des éléments sur les mots *ayon/mvog*. Les définitions sont reformulées ; le cadre et la source de chaque exemple restent affichés. La classification linguistique du LGIDF/CNRS est distinguée de la nomenclature historique de Bôt Ba Njock (1960). Aucun de ces découpages n’est présenté comme une hiérarchie universelle ou comme l’identité imposée à une famille actuelle.

Ces questions sont traitées avant tout accès au contexte familial : aucune lecture des personnes, noms, relations ou jetons n’est nécessaire pour définir un concept public. Les demandes de déduction personnelle à partir d’un nom ne produisent pas d’appartenance. Les autres conseils n’utilisent un contexte d’arbre qu’après vérification d’une appartenance active. Aucun champ ethnie/tribu/clan n’est automatiquement ajouté aux personnes et aucun profil sensible n’est calculé.

La réponse API ajoute un objet `explanation` versionné, en plus du texte existant : concepts, sources, exemple linguistique facultatif, récit pédagogique et type de schéma. Le frontend `IllustratedAnswer.jsx` utilise des dessins SVG symboliques originaux, des fiches interactives et trois scènes à parcourir. Un mode simple réduit le texte pour une lecture accompagnée. Les personnes dessinées sont fictives et ne représentent ni un membre de l’arbre ni un peuple. Les autres conseils disposent de schémas de généalogie, parcours ou transmission ; ils n’inventent pas une reconstitution historique. Les animations respectent `prefers-reduced-motion`, sans lecture automatique de l’histoire.

Le corpus est éditorial, fini et révisable. Il n’effectue pas de recherche Web à la volée et ne couvre pas tous les peuples ni toutes les acceptions locales. Enrichir un terme demande une source, un cadre géographique/historique et une relecture ; les désaccords entre auteurs restent contextualisés. Les questions nécessitant un témoignage familial ne sont pas résolues à partir d’une définition générale. Les sources principales sont reprises dans le README et dans chaque réponse illustrée.

Validation : questions de définition et comparaison, distinction langues/identités/parenté, absence d’inférence personnelle, absence de lecture de données privées pour les concepts, exclusion des membres inactifs pour le contexte, sources liées aux notions. Le navigateur vérifie les scènes, le mode simple, les schémas mobiles et la réduction des mouvements.

## Histoire et migrations

Le récit reprend deux présences consécutives, datées et à des lieux différents, pour une même personne. Il ne transforme pas l’intervalle en date de départ ni en itinéraire établi. Une présence renseignée dans l’arbre n’est pas en soi une preuve vérifiée. Les lieux sans date, dates invalides et présences simultanées ne suffisent pas à produire ce récit.

Le catalogue initial contient trois repères sourcés : Éthiopie 1984–1986 (MSF), Cameroun octobre 2016–mars 2019 (HCR, rapport arrêté à cette date), séisme d’Haïti du 12 janvier 2010 (USGS). La comparaison utilise les pays et l’intersection des dates exactes. Elle reste nationale et ne conclut pas qu’une personne était dans la région affectée. L’absence de correspondance ne signifie pas absence d’événements. Sources et résumés sont dans `historicalContexts.json` ; ils doivent être relus avant tout enrichissement.

Le produit sépare les présences renseignées, le contexte général et les questions d’enquête. Il ne calcule pas de probabilité de départ, ne prédit pas une migration future et n’attribue ni traumatisme, religion, culture ou origine ethnique. Famille, études et travail sont des pistes interrogatives, pas des causes inférées. Les récits de cultures, contes, recettes et traditions sont transmis dans le salon et dans les souvenirs, avec leur contexte familial. Une référence de recherche sur l’expansion bantoue ouvre une enquête collective sans attribuer de filiation aux personnes.

## Accès, hors ligne et exploitation

- Toutes les routes `/arbres/:arbreId/culture/*` utilisent JWT + appartenance active à l’arbre (`RolesGuard`). Le serveur vérifie aussi l’arbre des messages, curseurs, fiches et réponses.
- Lecteur : consulter et jouer ; contributeur : publier, répondre, proposer, gérer ses propres contenus ; administrateur/éditeur : modérer et valider. La validation ne peut pas être injectée dans la création d’une fiche.
- Le mode hors ligne préparé conserve la première page du salon et jusqu’à 1 000 fiches textuelles par arbre. Les réponses doivent avoir été chargées en ligne pour être mises en cache. Les voix ne sont pas mises en cache. Les écritures culturelles nécessitent une connexion et ne passent pas dans l’ancienne file de brouillons. Les pays, langues et repères historiques sont embarqués dans les fichiers de l’application.
- Pas de lecture de données familiales par un service IA tiers ni de recherche web envoyant les noms ou déplacements des proches. Le rapprochement historique et les suggestions sont locaux.
- Migration additive `20261102180000_family_culture` : deux tables, indexes et clés étrangères. Aucun changement destructif des personnes/liens/souvenirs. Le build Vercel applique `prisma migrate deploy` ; le build local génère le client et compile sans migrer une base distante.
- Validation : tests de cloisonnement/modération/audio/DTO/pagination côté API ; tests de suggestions, correction des diacritiques et chronologie côté client ; parcours navigateur avec réponses API simulées. Le micro physique et la qualité de prononciation doivent être vérifiés avec de vrais locuteurs/appareils.

## Enrichissement éditorial

Pour ajouter un cours : travailler avec un locuteur compétent et une référence, identifier la variante, écrire des fiches alphabet/sons, mots, règles avec exemples et recueillir les voix avec accord. Pour ajouter un repère historique : une source traçable, une période précise, un périmètre géographique explicite, une formulation accessible et une relecture. Aucun récit oral ne devient automatiquement un fait attesté.
