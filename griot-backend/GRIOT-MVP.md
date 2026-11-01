# GRIOT — MVP de démonstration

**Projet :** GRIOT — mémoire numérique des familles africaines
**Porté par :** GAM Labs (contact.gamlabs@proton.me)
**Statut :** Prototype de démonstration investisseurs (données fictives, non connecté à un backend)
**Dernière mise à jour :** 19 juillet 2026 (v7)
**Documents associés :** `GRIOT-Conception-SI.md` (architecture système) · `griot-backend/` (code du backend — Lot 1)

---

## 1. Ce que c'est

Un prototype interactif, livré sous forme d'**un seul fichier HTML autonome** (`griot-prototype.html`), qui simule l'expérience complète de l'application GRIOT : de la découverte du produit à la gestion d'un arbre généalogique familial, en passant par la préservation de mémoire culturelle (histoires, traditions, frise historique).

Il n'y a **pas de backend** : toutes les données (personnes, familles, traditions...) sont fictives et codées en dur. Les interactions (cocher une mission, changer un avatar, etc.) fonctionnent en direct dans le navigateur mais ne sont **pas sauvegardées** — tout se réinitialise au rechargement de la page.

## 2. Comment l'ouvrir

Double-cliquer sur `griot-prototype.html`, ou le glisser dans un onglet de navigateur. **Fonctionne sans connexion internet** une fois le fichier téléchargé (voir §5).

## 3. Stack technique

| Élément | Choix | Pourquoi |
|---|---|---|
| UI | React 18 | Composants réutilisables pour les 11 écrans |
| Icônes | lucide-react | Cohérence visuelle |
| Build | esbuild | Bundle unique, minifié, sans dépendance externe au runtime |
| Distribution | 1 fichier `.html` | Zéro installation, partageable par email/USB/WhatsApp |
| Police | Google Fonts (Fraunces + Work Sans) | Seule ressource encore chargée depuis internet — dégrade proprement vers une police système si absente |

## 4. Écrans disponibles

Navigables depuis le rail de gauche du prototype :

1. **Accueil** — animation d'intro (~6,5s, passable), accroche produit, positionnement
2. **Créer un compte** — parcours d'inscription
3. **Tableau de bord** — vue d'ensemble : arbre, missions de la semaine, score de complétude, collaborateurs, nudge de viralité
4. **Arbre généalogique** — visualisation interactive, **4 modes d'affichage** :
   - *Normal* : initiales (nom, prénom)
   - *Automatique* : cascade — photo → avatar personnalisé → avatar auto-généré → initiales (contour pointillé = généré automatiquement)
   - *Avatar* : icônes culturelles par catégorie — Animaux (africains), Figures inspirantes, Métiers du quotidien
   - *Image* : emplacement photo

   Bascule d'accessibilité "Avatars activés / Mode sobre" (réglage personnel, local à chaque utilisateur).
5. **Fiche personne** — profil détaillé (bio, médias, voix, docs, carte, liens, chronologie, objets), **avatar personnalisable**
6. **Rôles & permissions** — matrice des niveaux d'accès (Administrateur / Éditeur / Contributeur / Lecteur)
7. **Identité familiale** — niveau partagé, admin uniquement : thème de famille (6 styles), devise, style d'avatar par défaut, aperçu bannière
8. **Carte des origines** — migrations familiales animées, villes + dates
9. **Mémoire familiale** — histoires, traditions vivantes (cuisine, danses, mariages, funérailles...), frise historique
10. **Espace chefferie** — vue institutionnelle (desktop)
11. **Démo multi-écrans** — animation phone → tablette → ordinateur
12. **Charte graphique** — palette, typographie, positionnement produit

## 5. Fonctionnalités transversales

- **Mode hors ligne** : bandeau + détection réseau réelle, bouton "Simuler le mode hors ligne" pour la démo. Le fichier lui-même est 100 % autonome (aucun appel CDN pour le JS).
- **Protections dissuasives** : clic droit désactivé, raccourcis DevTools bloqués, copyright visible (© GAM Labs).
- **Responsive** : démonstration animée de l'app sur mobile/tablette/desktop.
- **Personnalisation** : affichage de l'arbre configurable, avatars de profil personnalisables (couleur, emoji, ou simulation photo).

## 6. Limites connues (à garder en tête pour les questions investisseurs)

- Aucune persistance de données (tout est en mémoire, perdu au rechargement)
- Aucun vrai moteur de recherche/navigation pour un arbre de centaines de personnes (zoom infini, regroupement — non implémenté, à ne pas simuler en démo live)
- Le mode hors ligne réel (stockage local, synchronisation, résolution de conflits) reste à concevoir pour la version production
- Chiffres d'usage retirés de l'accueil pour rester honnête sur le stade de lancement

## 7. Roadmap identifiée (retours investisseurs / mentors)

- [ ] Moteur de navigation d'arbre pour grandes familles (zoom infini, regroupement, recherche, filtres)
- [ ] Vraie architecture hors ligne (IndexedDB, Service Worker, sync)
- [ ] Upload réel de photos et sauvegarde des préférences d'affichage par utilisateur
- [ ] Système de missions/complétude connecté à de vraies données

---

## Changelog

### 19 juillet 2026 (v7) — début du développement réel (backend)
- Démarrage de `griot-backend/` : projet **NestJS + Prisma + PostgreSQL** réel, destiné au déploiement (ce n'est plus une maquette)
- Schéma de base de données complet (`prisma/schema.prisma`) traduisant toutes les entités du dossier de conception
- **Lot 1 (socle) implémenté** : inscription/connexion (JWT), création d'arbre, gestion des membres et rôles, RBAC réel par arbre (`RolesGuard` vérifiant le rôle sur l'arbre concerné, pas un rôle global), CRUD Personnes avec logique Contributeur (proposition) vs Éditeur (modification directe), Relations familiales
- Choix techniques validés avec la personne : NestJS (plutôt qu'Express) et Prisma (plutôt que TypeORM)
- **Limite connue** : le code n'a pas pu être compilé de bout en bout dans l'environnement de l'assistant (le moteur binaire Prisma nécessite un téléchargement depuis `binaries.prisma.sh`, bloqué par la politique réseau du bac à sable) — à vérifier en local
- `docker-compose.yml` fourni pour une base PostgreSQL locale, README avec instructions de démarrage complètes

### 18 juillet 2026 (v6) — conception uniquement, refonte en domaines métier
- `GRIOT-Conception-SI.md` réorganisé autour de **12 domaines métier** (Identity & Trust, Family Management, Genealogy Engine, Heritage Management, Media Management, Visualization Engine, Offline & Sync, AI Services, Governance & Compliance, Administration, Analytics, Integration & APIs), suite à un retour externe structurant
- Nouvelle distinction explicite **Portée V1 vs Vision cible** (§1.2) pour éviter la sur-ingénierie prématurée
- Ajout du modèle **Source & Preuve** (§13) au MCD — fondation du domaine Heritage Management, volontairement simple pour la V1
- Nouvelle section **Identity & Trust Management — portée V1** (§14) : email/téléphone/MFA en V1, KYC/OCR/vivacité/Trust Score explicitement repoussés en vision cible, avec justification (adoption en zone rurale à faible connectivité)
- Section 12 renommée **Visualization Engine**, avec vision cible des vues futures (compact, diaspora, patrimoine, chefferie, chronologique)
- Roadmap étendue : Lot 9 (Source & Preuve) ajouté à la V1, Lots 10-14 identifiés comme vision cible non détaillée
- *Non répercuté dans le prototype HTML — travail de conception uniquement.*

### 18 juillet 2026 (v5) — le moteur de personnalisation arrive dans le prototype
- Nouveau mode d'affichage **Automatique** sur l'écran Arbre : applique la cascade photo → avatar personnalisé → avatar auto-généré → initiales sur des données de démonstration (quelques personnes ont une "photo", d'autres un avatar personnalisé, le reste bascule sur un avatar généré automatiquement — contour pointillé pour le distinguer visuellement)
- Bascule d'accessibilité "Avatars activés / Mode sobre" sur l'écran Arbre — réglage personnel, explicitement annoté comme tel
- Nouvel écran **Identité familiale** (rail gauche + lien "🎭 Identité familiale →" depuis l'écran Arbre) : sélection du thème de famille parmi 6 styles (Moderne, Traditionnel africain, Aquarelle, Minimaliste, Archives anciennes, Royal) avec aperçu de bannière live, devise éditable, style d'avatar par défaut — explicitement annoté "visible par tous les membres, modifiable par les administrateurs"
- Distinction visuelle claire entre réglage personnel (page Arbre) et réglage familial partagé (nouvel écran), conformément à la conception SI §12

### 18 juillet 2026 (v4) — conception uniquement, prototype non modifié
- Formalisation du **Moteur de personnalisation et de visualisation** dans `GRIOT-Conception-SI.md` (section 12) : cascade d'affichage automatique (photo → avatar personnalisé → avatar auto-généré → initiales), catégories d'avatars sémantiques élargies (âge/génération, rôle culturel, parcours de vie), deux niveaux de gouvernance — préférences personnelles (`PREFERENCE_AFFICHAGE`) vs identité familiale partagée (`IDENTITE_FAMILIALE`), 6 thèmes de famille, bascule d'accessibilité pour désactiver les avatars
- MCD mis à jour : ajout des entités `PREFERENCE_AFFICHAGE` et `IDENTITE_FAMILIALE`, champ `avatar_categorie` ajouté à `PERSONNE`
- Roadmap technique : ajout du Lot 8 (moteur de personnalisation et de visualisation)
- *Non encore implémenté dans le prototype HTML — ceci est un travail de conception, à répercuter sur la démo si besoin.*

### 18 juillet 2026 (v3)
- Démarrage du dossier de conception du Système d'Information : `GRIOT-Conception-SI.md` (architecture globale, MCD, dictionnaire de données, rôles/permissions en RBAC, architecture du mode hors ligne, sécurité, infrastructure, roadmap technique)

### 18 juillet 2026 (v2)
- Refonte du mode d'affichage "Avatar" de l'arbre : remplacement des initiales par des icônes culturelles sélectionnables par catégorie — Animaux africains (🦁🐘🦒...), Figures inspirantes (symboles génériques : couronne, poing levé, colombe, tambour — pas de portraits de personnes réelles nommées), Métiers du quotidien (👮🏾🧑🏾‍⚕️🧑🏾‍🏫...)
- Renommage des modes : "Classique" → "Normal" (initiales), "Photos" → "Image" (inchangé)

### 18 juillet 2026
- Ajout de la personnalisation d'affichage de l'arbre (classique / avatars / photos)
- Ajout de la personnalisation d'avatar sur la fiche personne (couleur, emoji, simulation photo)
- Fichier rendu 100 % autonome / consultable hors ligne (bundle esbuild, React + ReactDOM + lucide-react intégrés)
- Ajout du bandeau et de la simulation de mode hors ligne
- Retrait des mentions à MyHeritage (accueil + charte graphique)
- Recalibrage du timing de l'animation d'intro (~6,5s, lisible)
- Ajout : rôles & permissions, missions de la semaine, score de complétude, nudge de viralité, carte des migrations animée, frise historique, traditions vivantes élargies
- Ajout de l'animation démo multi-écrans (phone → tablette → desktop)
- Ajout des protections dissuasives + copyright GAM Labs
- Réduction de la durée de l'onboarding (de ~8,6s à une première version ~3,9s, puis recalibré ci-dessus)
- Remplacement des chiffres d'usage fictifs par un positionnement "familles fondatrices"
- Nouvelle accroche d'accueil : "Retrouvez vos ancêtres. Préservez leur mémoire. Transmettez-la à vos enfants."

### Avant le 18 juillet 2026
- Conversion initiale du prototype React en fichier HTML consultable (CDN, puis autonome)
