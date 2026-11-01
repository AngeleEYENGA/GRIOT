# 🏛️ GRIOT — MVP Local Responsive

**État:** ✅ Prêt pour développement et test local  
**Date:** 7 août 2026  
**Version:** 2.0 (Refonte responsive, sans démos)

---

## 📋 Résumé des changements

### ✅ Terminé
- ✅ **Design responsive** — Mobile, tablet, desktop
- ✅ **Suppression écrans inutiles** — Plus de démo ni charte graphique
- ✅ **Amélioration UI/UX** — Modales, formulaires, animations
- ✅ **Module API** — Patterns d'intégration backend ready
- ✅ **Documentation complète** — Guides et exemples

### 📦 Fichiers livrés

| Fichier | Description | Taille | Usage |
|---------|-------------|--------|-------|
| **griot-app.html** | App complète avec modales | 850 KB | Développement |
| **griot-mvp.html** | Version minimale | 280 KB | Test rapide |
| **griot-api.js** | Module API + helpers | 12 KB | Intégration backend |
| **GRIOT-MVP-LOCAL.md** | Guide complet MVP | Documentation | Référence |
| **INTEGRATION-API.md** | Exemples d'intégration | Documentation | Développement |

---

## 🚀 Démarrage rapide

### Option 1: Fichier HTML autonome (zéro installation)
```bash
# Ouvrir simplement dans le navigateur
open griot-backend/public/griot-app.html
```

### Option 2: Servir via backend NestJS
```bash
cd griot-backend
npm install
npm run start:dev

# Accéder à http://localhost:3001/griot-app.html
```

### Option 3: Avec serveur HTTP simple
```bash
cd griot-backend/public
python -m http.server 8000
# Ouvrir http://localhost:8000/griot-app.html
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile** (< 640px): Navigation horizontale en bas
- **Tablet** (640-1024px): Navigation latérale réduite
- **Desktop** (> 1024px): Layout complet 3 colonnes

### Testé sur
- ✅ iPhone 12, 14 Pro
- ✅ iPad, iPad Pro
- ✅ Chrome DevTools emulation
- ✅ Firefox responsive mode

---

## 🎨 Système de design conservé

### Palette
```css
Crème (#f6efe1) — Fond principal
Papier (#fffbf3) — Cartes & modales
Encre (#2b1b12) — Texte principal
Or (#c9932e) — Accent primaire
Terracotta (#b5502a) — Accent secondaire
Olive (#4b5d3b) — Accent tertaire
```

### Typo
- **Serif (Fraunces)** — Titres, headers
- **Sans (Work Sans)** — Corps, UI

---

## 🔌 Écrans disponibles

### 1. Accueil
- ✅ Responsive
- ✅ CTA primaire/secondaire
- ✅ 4 cartes de valeurs
- 🔌 **À intégrer:** Modal de connexion réelle

### 2. Tableau de bord
- ✅ Stats arbre (47 personnes)
- ✅ Missions de la semaine
- ✅ Équipe collaborateurs
- ✅ Actions rapides
- 🔌 **À intégrer:** Charger données de l'API

### 3. Arbre généalogique
- ⚠️ Placeholder (visualiseur)
- 🔌 **À développer:** D3.js ou vis.js pour visualisation

### 4. Mémoire familiale
- ✅ 4 catégories (histoires, cuisine, dances, rituels)
- ✅ Boutons d'action
- 🔌 **À développer:** Formulaires d'upload

### 5. Carte des origines
- ⚠️ Placeholder (cartographie)
- 🔌 **À développer:** Leaflet ou Mapbox

### 6. Équipe
- ✅ Formulaire d'invitation
- ✅ Liste collaborateurs
- ✅ Badges de statut
- 🔌 **À intégrer:** Appels API

---

## 🔗 Intégration Backend

### Setup API
```javascript
// Dans griot-app.html, ajouter:
<script src="griot-api.js"></script>

// Initialiser:
const api = new GriotAPI('http://localhost:3001/api');
```

### Exemples d'utilisation
```javascript
// Connexion
const user = await api.auth.login(email, password);

// Récupérer les arbres
const trees = await api.trees.list();

// Ajouter une personne
await api.persons.create(treeId, {
  nom: 'Mvondo',
  prenom: 'Jean',
  dateNaissance: 1945,
  lieuOrigine: 'Nkolbisson'
});

// Ajouter un souvenir
await api.memories.create(treeId, {
  titre: 'Le grand manguier',
  description: 'Histoire familiale...',
  categorie: 'histoire'
});
```

### Endpoints backend à implémenter
```
[✅ Probablement existants selon le schéma Prisma]

Auth:
  POST   /api/auth/register       — Inscription
  POST   /api/auth/login          — Connexion
  GET    /api/auth/me             — Profil courant

Arbres:
  GET    /api/arbres              — Lister mes arbres
  POST   /api/arbres              — Créer un arbre
  GET    /api/arbres/:id          — Détail arbre
  PATCH  /api/arbres/:id          — Modifier arbre

Personnes:
  GET    /api/personnes           — Lister personnes
  POST   /api/personnes           — Ajouter personne
  GET    /api/personnes/:id       — Détail personne
  PATCH  /api/personnes/:id       — Modifier personne

Souvenirs:
  GET    /api/souvenirs           — Lister souvenirs
  POST   /api/souvenirs           — Ajouter souvenir
  POST   /api/souvenirs/:id/media — Upload média

Collaborateurs:
  POST   /api/membres-arbre/invite  — Inviter
  GET    /api/membres-arbre         — Lister collaborateurs
  PATCH  /api/membres-arbre/:id     — Changer rôle
```

---

## 📚 Fichiers de référence

### Documentation
- **GRIOT-MVP-LOCAL.md** — Guide MVP complet
- **INTEGRATION-API.md** — Exemples d'intégration avec code
- **GRIOT-Conception-SI.md** — Architecture système global

### Backend
- **griot-backend/prisma/schema.prisma** — Modèle de données
- **griot-backend/src/app.module.ts** — Modules NestJS
- **griot-backend/package.json** — Dépendances

### Assets
- **griot-api.js** — Module API client complet

---

## ⚙️ Stack technique

### Frontend
- **React 18** — Composants (via CDN)
- **CSS Custom Properties** — Variables et responsive
- **Vanilla JavaScript** — Pas de build complexe

### Backend (existant)
- **NestJS 10** — Framework API
- **Prisma 5** — ORM + migrations
- **PostgreSQL** — Base de données
- **JWT** — Authentification

---

## 🛠️ Tâches prioritaires (Roadmap)

### Phase 1: Connexion API (1-2 jours)
- [ ] Implémenter LoginModal avec api.auth.login()
- [ ] Sauvegarder token JWT dans localStorage
- [ ] Charger profil utilisateur dans Dashboard
- [ ] Créer/lister arbres depuis API

### Phase 2: Formulaires fonctionnels (2-3 jours)
- [ ] Ajouter personne → POST /api/personnes
- [ ] Ajouter souvenir → POST /api/souvenirs
- [ ] Inviter collaborateur → POST /api/membres-arbre/invite
- [ ] Validation & gestion d'erreurs

### Phase 3: Visualisations (3-5 jours)
- [ ] Visualiseur d'arbre (D3.js)
- [ ] Cartographie des migrations (Leaflet)
- [ ] Timeline des événements

### Phase 4: Offline & Sync (5-7 jours)
- [ ] Service Worker pour cache
- [ ] Sync queue avec localStorage
- [ ] Résolution de conflits

---

## 🐛 Débogage

### Mode offline
Dans le navigateur console:
```javascript
// Simuler mode hors ligne
navigator.onLine = false;
window.dispatchEvent(new Event('offline'));
```

### Inspecter l'API
```javascript
// En console
const api = new GriotAPI();
await api.auth.me();  // Tester la connexion
```

### Logs API
```javascript
// Activer les logs détaillés
window.debugAPI = true;
```

---

## 📞 Support & Questions

### Architecture
→ Voir `GRIOT-Conception-SI.md` (MCD, schéma, sécurité)

### Backend
→ Voir `griot-backend/README.md`

### Frontend patterns
→ Voir `INTEGRATION-API.md` (exemples complets)

---

## ✨ Prochaines améliorations

- [ ] Thème clair/sombre
- [ ] Internationalization (i18n)
- [ ] PWA (installable)
- [ ] Real-time collaboration (WebSocket)
- [ ] Notifications push
- [ ] Export/Import données

---

**Auteur:** Équipe GRIOT  
**Licence:** À définir  
**Support:** contact.gamlabs@proton.me
