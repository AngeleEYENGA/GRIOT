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
