# GRIOT — Mémoire familiale

**Préserver. Transmettre. Relier.**

GRIOT est une application de généalogie et de mémoire familiale portée par GAM Labs. Elle réunit les personnes, les liens de parenté, les récits, les médias et les lieux qui composent l’histoire d’une famille.

Une mémoire familiale ne se résume pas à des noms et des dates. Elle comprend aussi une recette transmise, la voix d’un aîné, un village d’origine, une photographie ou un témoignage. GRIOT offre un espace commun pour conserver ces éléments, les relier aux personnes et les enrichir progressivement avec ses proches. Chaque arbre possède ses membres et ses propres droits d’accès.

**[Ouvrir GRIOT](https://griot-frontend-teal.vercel.app/)** · **[Documentation API](https://griot-backend-bice.vercel.app/docs)**

**Gestion du projet : [GitLab GRIOT-GAMLab](https://gitlab.com/griot-gamlab/GRIOT)** · [Organisation, jalons et backlog](docs/GESTION-PROJET.md) · [Contribuer](CONTRIBUTING.md) · [Index documentaire](docs/README.md). GitHub reste relié aux déploiements Vercel pendant la transition.

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

**Pour vérifier la carte et les récits sans compte : [ouvrir les quatre arbres publics de démonstration](https://griot-frontend-teal.vercel.app/#/demonstrations).** Ces exemples fictifs, en lecture seule, utilisent les mêmes composants de généalogie, carte et histoire que les arbres familiaux. Ils couvrent Éthiopie–Cameroun, une diaspora dans quatre pays, des données incomplètes et un aller-retour Haïti–France. Ils sont intégrés à l’application comme jeux de démonstration et ne sont pas des comptes ou dossiers de personnes réelles dans la base. Voir [les cas et les vérifications attendues](docs/DEMONSTRATIONS-PUBLIQUES.md).

1. Créez un compte ou connectez-vous. Google OAuth nécessite la configuration décrite dans [DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md).
2. Depuis le **tableau de bord**, choisissez un arbre ou créez votre premier espace familial.
3. Dans **Fiche personne**, ajoutez prénom, nom, dates, biographie et lieu d’origine.
4. Dans **Relations**, reliez deux personnes et consultez ensuite l’arbre généalogique.
5. Dans **Mémoire familiale**, conservez une histoire, une tradition ou un média.
6. Dans **Carte des origines**, associez des lieux et des étapes à une personne.
7. Invitez vos proches avec le rôle adapté. Ils doivent disposer d’un compte et accepter l’invitation depuis la cloche des notifications.
8. Dans **Espace collaboratif & langues**, retrouvez le salon familial, les fiches et les jeux de langue, ainsi que **L’histoire de nos parcours**.

Un **guide de navigation par étapes** est disponible avec le bouton **?**, le menu de gauche et le menu mobile **Plus**. Un encart de bienvenue l’indique aux nouveaux utilisateurs. Masquer cet encart conserve l’accès au guide ; ce choix est mémorisé localement par compte et navigateur.

Sur ordinateur, le menu de gauche ouvre les rubriques. Sur mobile, les raccourcis sont en bas et **Plus** affiche les autres écrans. Dans un arbre, **Mes arbres** ramène à la liste des arbres ; **Autres rubriques** donne accès aux espaces complémentaires, dont le cercle familial. L’avatar ouvre **Mon compte**.

## Fonctionnalités disponibles

| Espace | Principe |
| --- | --- |
| Accueil familial | Retrouver ses arbres et créer un espace de transmission. |
| Tableau de bord d’un arbre | Chiffres, missions de démarrage, collaborateurs, souvenirs et derniers ajouts. |
| Repères familiaux | Prochains anniversaires des personnes sans date de décès renseignée et complétude des profils : biographie, naissance, origine. |
| Atelier de transmission | Amorces de récits sur les aînés, les traditions et les lieux de mémoire. |
| Généalogie | Conjoints rapprochés, branches communes pour leurs enfants, libellés des liens et filtres de branche. |
| Fiches personnes | Biographies, dates, liens et médias selon les droits attribués. |
| Mémoire familiale | Souvenirs, traditions, commentaires et médias. |
| Carte des origines | Lieux associés aux personnes et lecture des étapes d’un parcours familial. |
| Salon familial privé | Publications et réponses par thèmes : langues, discussions, contes, cuisine, traditions et migrations. |
| Atelier des langues | Suggestions par pays avec Glottolog, choix d’une langue ou variante, fiches de mots, alphabet et grammaire créées par les proches. |
| Jeux et voix | Découverte par choix et écoute, pratique écrite, prononciations courtes et relecture familiale avant utilisation des fiches dans les jeux. |
| Mes parcours de langues | Fang, anglais, allemand, espagnol et chinois mandarin : initiations préparées, exercices, explications et révisions adaptées, même sans locuteur dans la famille. Propositions selon toutes les branches géographiques. |
| Histoire des parcours | Récit des présences datées, repères historiques sourcés et questions à approfondir avec la famille. |
| Explications culturelles illustrées | Différences entre ethnie, tribu, clan et lignage ; repères Fang–Ewondo–Bulu, sources, dessins symboliques, mode simple et récits pédagogiques en trois scènes. |
| Rapports & impression | Arbre et rapport imprimables/PDF avec en-tête, filigrane GRIOT et pied de page ; exports CSV. |
| Charte graphique | Modes clair/sombre/système et palettes appliqués immédiatement. |
| Mode hors ligne | Copies préparées, consultation et brouillons de personnes, liens, lieux et souvenirs textuels. |
| Rôles & permissions | Membres, invitations et gestion des rôles. |
| Chefferie | Preuves, transmission institutionnelle et membres institutionnels selon les accès. |
| Mon compte | Modification du prénom, du nom et du téléphone ; changement du mot de passe d’un compte local. |
| Guide | Parcours de découverte et réponses aux questions de navigation. |

L’interface est responsive. Les animations respectent la préférence système de réduction des mouvements. La fiche personne possède son propre défilement et peut être fermée avec sa croix, Échap ou un clic sur le fond.

## Langues, cultures et histoire : première version

Le **cercle familial** relie trois espaces au sein d’un arbre :

- **Le salon familial** accueille les échanges, contes, anecdotes, recettes et traditions. Les publications ont un thème et des réponses ; les auteurs et les responsables peuvent modérer selon leurs droits. L’actualisation est manuelle dans cette première version.
- **Apprendre nos langues** propose des langues à partir des pays explicitement renseignés dans les parcours. Le catalogue [Glottolog 5.3](https://github.com/glottolog/glottolog-cldf), sous CC BY 4.0, est intégré à GRIOT. Une suggestion géographique ne détermine pas la langue natale ni l’identité culturelle d’une personne. La famille confirme la langue ou indique une variante, puis crée les fiches avec un locuteur ou une référence.
- **L’histoire de nos parcours** raconte les lieux et dates enregistrés pour une même personne et les rapproche de repères historiques. Un événement général n’est jamais présenté comme la cause prouvée d’un départ individuel. Les questions sur les études, le travail, la famille ou le contexte historique invitent à rechercher des témoignages et des archives.

Les fiches peuvent contenir une expression, un signe ou une syllabe, un exemple grammatical, sa traduction, une explication et une source. Une voix peut être enregistrée pendant 15 secondes au maximum ou importée, avec une limite de 512 Kio. Les administrateurs et éditeurs relisent les fiches ; seules les fiches validées entrent dans les jeux. Les approches **découverte** et **pratique** proposent respectivement des choix/écoutes et des réponses écrites. Les accents et les tons sont conservés. La progression est personnelle à cet appareil ; le mode enfant suppose un accompagnement adulte.

**Ce qui n’est pas encore fourni :** des cours complets prêts à l’emploi pour chaque langue, une correction automatique de la prononciation, un chat en temps réel et une base historique mondiale. Le premier catalogue de repères couvre l’Éthiopie de 1984 à 1986, le Cameroun d’octobre 2016 à mars 2019 et le séisme d’Haïti du 12 janvier 2010, avec leurs sources. L’absence de repère ne signifie pas absence d’événements.

### Apprendre sans locuteur dans la famille : cinq parcours guidés

Dans **Espace collaboratif & langues → Mes parcours de langues**, choisissez une initiation et commencez sans attendre la création de fiches familiales. Les parcours sont aussi proposés dans **Apprendre nos langues**. Le fang reste la première langue patrimoniale disponible ; ce choix ne détermine pas la langue natale des personnes de l’arbre.

Le panneau **Les langues à explorer ensemble** considère les pays de toutes les présences de toutes les personnes, pas seulement la dernière destination de l’arbre. Il distingue les langues choisies par la famille, les propositions pratiques pour les pays des dernières présences datées et celles des étapes anciennes. Un lieu sans date ne remplace pas une présence datée ; des derniers pays contradictoires restent incertains. Une dernière présence connue n’est pas une résidence actuelle prouvée.

**Anglais, allemand, espagnol et chinois mandarin** disposent chacun de **trois étapes et neuf éléments** : six expressions/formes et trois questions de compréhension ou de grammaire. Ils reprennent les mécanismes de progression décrits ci-dessous. Ces initiations ne sont pas des formations complètes de niveau A1. Le mandarin est nommé explicitement : il ne représente pas toutes les langues parlées en Chine. Pour les autres langues, le catalogue Glottolog permet l’exploration géographique et la création de fiches familiales ; il ne fournit pas automatiquement des cours.

**Essayer sans compte :** ouvrez [l’arbre public de la diaspora](https://griot-frontend-teal.vercel.app/#/demonstrations/diaspora), puis **Personnages et langues**. Londres, Berlin, Madrid et Shanghai proposent les quatre cours pratiques ; le fang reste une langue déclarée distincte. Les cours publics conservent seulement une progression locale au navigateur, avec un bouton d’effacement par langue dans leurs détails.

- **Fang : quatre étapes et treize éléments** : salutations, premières formules d’échange, vocabulaire et repères grammaticaux du fang-ntumu. Le cours distingue cette variété des autres variétés fang et conserve les transcriptions de ses sources.
- **Deux approches** : reconnaître le sens ou retrouver la forme écrite, avec un petit clavier de signes phonétiques et de tons. Les étapes suivantes s’ouvrent après une réussite sans aide pour chaque élément de l’étape précédente.
- **Adaptation** : une erreur revient en priorité et programme une révision après cinq minutes ; les réussites sans aide espacent ensuite les révisions à un, trois, sept et quatorze jours. L’aide du coach ne compte pas comme une réussite sans aide.
- **Rendez-vous personnel** : objectif quotidien de trois, cinq ou dix éléments, points de pratique et jours consécutifs. Un même élément ne rapporte des points qu’une fois par jour. Il ne s’agit pas d’un niveau de langue certifié.
- **Coach de cours** : explications sourcées et conseils fondés sur les éléments enseignés. Ce moteur guidé n’appelle pas d’IA générative externe, ne traduit pas de phrases libres et indique lorsqu’une question dépasse le cours.
- **Première pratique orale** : démonstration externe de « Mbóló » publiée par Dzaleu, chargée seulement après un clic, et enregistrement personnel de dix secondes pour se réécouter. Cet essai reste temporaire sur l’appareil, sans envoi ni partage. Les autres éléments n’ont pas encore de modèle oral vérifié ; aucune note automatique de prononciation n’est affichée et aucune voix française n’est présentée comme du fang.
- **Écoute des quatre nouveaux cours** : synthèse vocale sur clic, seulement si l’appareil fournit une voix dans la locale demandée. La lecture est indiquée comme synthétique ; aucune autre langue n’est substituée silencieusement. Le pinyin accompagne les leçons de mandarin, et le clavier aide à retrouver les caractères. La disponibilité des voix hors ligne dépend de l’appareil ([documentation de l’API vocale](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)).
- **Au village** : les leçons et la progression fonctionnent sur l’appareil après préparation hors ligne ; la vidéo YouTube externe nécessite une connexion. La progression est séparée par compte, arbre et cours et effacée à la déconnexion ou avec les données locales. Les exercices d’un cours ne débloquent pas ceux d’une autre langue.

Références complémentaires des nouvelles initiations : [British Council](https://learnenglish.britishcouncil.org/free-resources/listening/a1/meeting-people-dinner), Ministry for Ethnic Communities ([allemand](https://www.ethniccommunities.govt.nz/resources/information-and-resources-in-other-languages/greetings-in-different-languages/greetings-in-german), [espagnol](https://www.ethniccommunities.govt.nz/resources/information-and-resources-in-other-languages/greetings-in-different-languages/greetings-in-spanish)) et [Instituto Cervantes Shanghai](https://shanghai.cervantes.es/imagenes/File/Guia_de_Shanghai_2025.pdf). Les sources restent accessibles depuis les leçons.

Les sources du premier parcours sont la [fiche fang-ntoumou du LGIDF/CNRS](https://lacito.cnrs.fr/wp-content/uploads/2022/04/5.FANG_.NTOUMOU8oct21-copie_1.pdf), l’étude de [Pamphile Mebiame-Akono sur les rituels communicatifs fang-ntumu](https://publicrell.crelluob.com/uploads/Article8-No4%20Special.pdf) et la [démonstration de Mbóló par Dzaleu](https://dzaleu.net/mini-quiz-que-signifie-mbolo-en-langue-ekang/). Les consignes, exercices et règles de progression sont conçus pour GRIOT ; ils ne constituent pas une validation indépendante des transcriptions ni un cours complet équivalent au catalogue de Duolingo.

### Comprendre ethnie, tribu, clan et lignage en images

Dans **Demander à GRIOT**, posez une question sur ces notions ou utilisez les suggestions. Les réponses s’appuient sur un premier corpus éditorial de définitions et d’études, avec des liens vers les sources : ce n’est pas une recherche exhaustive du Web en temps réel.

L’assistant distingue l’identité culturelle, l’organisation sociale et la filiation. Il ne classe pas automatiquement tous les groupes dans une hiérarchie unique et ne déduit pas une ethnie ou un clan d’un patronyme, d’un pays ou des personnes de l’arbre. Pour **Fang, Ewondo et Bulu**, il distingue un cadre linguistique du LGIDF/CNRS et un exemple de nomenclature historique situé en 1960. Une parenté entre langues n’est pas une preuve de filiation entre personnes. Les termes locaux, tels que *ayon* ou *mvog*, sont présentés avec leur source et leur contexte.

Les réponses comprennent des fiches de notions avec dessins symboliques, une version simple à lire avec les enfants et une petite histoire en trois scènes. Les personnages sont fictifs ; les dessins n’attribuent pas de traits physiques ou de costume à une ethnie. Les conseils sur la généalogie, les parcours et la transmission disposent également de schémas adaptés à leur thème. Les animations restent facultatives selon la préférence système de réduction des mouvements.

Références : [OQLF — ethnie](https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/17094349/ethnie), Académie française ([tribu](https://www.dictionnaire-academie.fr/article/A9T2178), [clan](https://www.dictionnaire-academie.fr/article/A9C2485), [lignage](https://www.dictionnaire-academie.fr/article/A9L0800)), [LGIDF/CNRS — fang boulou](https://lgidf.cnrs.fr/fang-boulou), [H.-M. Bôt Ba Njock, 1960](https://www.persee.fr/doc/jafr_0037-9166_1960_num_30_2_1922) et [Simon David Yana — parenté Fang-Béti-Bulu, IRD](https://horizon.documentation.ird.fr/exl-doc/pleins_textes/pleins_textes_6/colloques2/39916.pdf).

La préparation hors ligne conserve les fiches textuelles et la première page des échanges. Publier, répondre, valider et écouter les voix nécessite une connexion. Les données de la famille ne sont pas envoyées à une IA tierce pour produire les suggestions ou les rapprochements historiques. Voir [la documentation fonctionnelle et technique du cercle](docs/CULTURE-ET-TRANSMISSION.md).

## Fonctionnalités prévues et feuille de route

Cette feuille de route décrit les évolutions à implémenter. **Elle ne représente pas des fonctionnalités déjà disponibles et ne fixe pas de date de livraison.** Le périmètre et l’ordre de réalisation seront affinés avec les familles, les locuteurs et les besoins du projet.

| Axe | Évolutions prévues | Conditions et précautions |
| --- | --- | --- |
| Cours de langues natales | Enrichir l’initiation autonome au fang déjà disponible, puis ajouter d’autres langues et des parcours complets : écriture, sons, tons, vocabulaire, grammaire et conversations. | Priorité initiale : fang. Travailler avec des locuteurs et des références ; distinguer les variantes et les contenus encore sans modèle oral. |
| Apprentissage ludique | Jeux d’association son/image/mot, mémoire, écoute et répétition, défis coopératifs, activités adaptées aux enfants et aux adultes. | Contenus relus, accessibilité et respect du rythme de chacun ; ne pas confondre un score de jeu et la maîtrise d’une langue. |
| Prononciation | Bibliothèque de voix de locuteurs, écoutes lentes, répétition et comparaison avec sa propre voix ; évaluation de prononciation à étudier. | Accord des locuteurs, maîtrise des enregistrements et vérification du support réel des langues avant toute notation automatique. |
| Apprendre ensemble | Rendez-vous avec les aînés, ateliers familiaux, défis partagés et suivi des activités collectives. | Participation volontaire, droits par arbre et accompagnement des enfants. |
| Réseau social familial | Échanges actualisés en temps réel, notifications des réponses, recherche dans le salon et partage de médias dans les discussions. | Maintenir un cercle privé, une modération familiale et des contrôles d’accès à chaque contenu. |
| Bibliothèque culturelle | Fiches structurées de contes, proverbes, anecdotes, traditions, fêtes et recettes, reliées aux personnes, langues, lieux et périodes. | Conserver la source, le contexte et les variantes ; ne pas présenter une tradition familiale comme universelle à tout un pays. |
| Histoire des peuples | Enrichir les repères sur les migrations de populations, les échanges culturels et linguistiques, les guerres, catastrophes et transformations sociales. | Sources historiques traçables, périmètres géographiques précis et relecture ; ne pas déduire une filiation à partir d’un pays ou d’une langue. |
| Enquête sur les migrations familiales | Ajouter des témoignages, documents, sources et versions contradictoires ; produire des récits plus riches et comparer les motifs possibles aux éléments recueillis. | Séparer les faits établis, les témoignages et les hypothèses. Aucune cause individuelle ni probabilité ne doit être inventée à partir de deux lieux. |
| Hors ligne au village | Téléchargement volontaire de petits packs de leçons et de voix, brouillons d’échanges et synchronisation culturelle avec gestion des conflits. | Prévoir la capacité de stockage, la confidentialité de l’appareil et une indication claire de ce qui est envoyé ou conservé localement. |
| Rapports de transmission | Intégrer les récits culturels, les langues et les contextes historiques sourcés aux rapports familiaux, avec une sélection des éléments à partager. | Préserver les droits, le statut de vérification et les sources dans les documents exportés. |

Pour préparer une évolution, documenter son objectif, les rôles concernés, les données et sources nécessaires, les critères d’acceptation, les tests et les limites. La [documentation du cercle](docs/CULTURE-ET-TRANSMISSION.md) décrit le socle ; [la gestion du projet](docs/GESTION-PROJET.md) définit le travail dans GitLab, les jalons et le backlog à importer.

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

Les médias des personnes et souvenirs sont stockés dans un store Vercel Blob privé et servis via l’API authentifiée, avec vérification du type réel et une limite de 4 Mio par fichier. Les courtes voix des fiches linguistiques sont stockées séparément en PostgreSQL, limitées à 512 Kio et accessibles uniquement aux membres autorisés via l’API. Les formats des médias généraux sont détaillés dans [DEPLOYMENT-VERCEL.md](DEPLOYMENT-VERCEL.md). La déconnexion retire le jeton de session et les copies locales du compte sur cet appareil. Ne partagez pas votre session et ne placez jamais de secrets dans Git.

## Architecture

```text
griot-frontend/     React, Vite, interface responsive et PWA
  src/components/  Navigation, dashboard, lieux et composants partagés
  src/pages/       Écrans familiaux, compte et guide
  src/api/         Client HTTP vers le backend
  src/data/        Pays GeoNames, langues Glottolog et repères historiques sourcés
  public/data/     Villes et provenance du catalogue
griot-backend/      NestJS, Prisma et PostgreSQL
  src/             Authentification et modules métier
  prisma/          Schéma de données et migrations
scripts/            Actualisation du catalogue géographique
docs/               Documentation des fonctionnalités et de leurs limites
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
