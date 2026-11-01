# GRIOT — MVP de démonstration

**Projet :** GRIOT — mémoire numérique des familles africaines
**Porté par :** GAM Labs (contact.gamlabs@proton.me)
**Statut :** Prototype de démonstration investisseurs (données fictives, non connecté à un backend)
**Dernière mise à jour :** 18 juillet 2026 (v3)
**Document associé :** `GRIOT-Conception-SI.md` (architecture système, modèle de données, sécurité)

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
4. **Arbre généalogique** — visualisation interactive, **3 modes d'affichage** :
   - *Normal* : initiales (nom, prénom)
   - *Avatar* : icônes culturelles par catégorie — Animaux (africains), Figures inspirantes (symboles : couronne, poing levé, colombe...), Métiers du quotidien
   - *Image* : emplacement photo
5. **Fiche personne** — profil détaillé (bio, médias, voix, docs, carte, liens, chronologie, objets), **avatar personnalisable**
6. **Rôles & permissions** — matrice des niveaux d'accès (Administrateur / Éditeur / Contributeur / Lecteur)
7. **Carte des origines** — migrations familiales animées, villes + dates
8. **Mémoire familiale** — histoires, traditions vivantes (cuisine, danses, mariages, funérailles...), frise historique
9. **Espace chefferie** — vue institutionnelle (desktop)
10. **Démo multi-écrans** — animation phone → tablette → ordinateur
11. **Charte graphique** — palette, typographie, positionnement produit

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
