# GRIOT — MVP Local Amélioré

**Date:** 7 août 2026  
**État:** ✅ Prêt pour développement local  
**Versions:**
- `griot-mvp.html` — Version minimale responsive
- `griot-app.html` — Version enrichie avec modales et formulaires

---

## 🎯 Améliorations apportées

### 1. **Design Responsive** ✅
- **Mobile-first** : Navigation horizontale en bas sur petit écran
- **Tablet** : Navigation réduite sur les côtés
- **Desktop** : Layout complet avec rails de navigation
- Testée sur breakpoints: 640px, 768px, 1024px

### 2. **Écrans conservés** (sans démos)
1. **Accueil** — Présentation produit + CTA
2. **Tableau de bord** — Vue d'ensemble, missions, complétude
3. **Arbre généalogique** — Placeholder pour visualiseur
4. **Mémoire familiale** — Histoires, traditions, rituels
5. **Carte des origines** — Migrations familiales
6. **Équipe** — Gestion des collaborateurs

### 3. **Écrans supprimés** ❌
- ❌ "Démo multi-écrans" (responsive demo)
- ❌ "Charte graphique" (design showcase)

### 4. **Fonctionnalités ajoutées** 🆕
- **Modales** pour connexion et ajout de personnes
- **Formulaires** pour inviter collaborateurs
- **Animations** fluides (fadeIn, slideIn, stagger)
- **Indicateur** en ligne/hors ligne
- **Grid layout** responsive
- **Badges** pour statuts
- **Accessibilité** améliorée (labels, contrast)

### 5. **UX Améliorée**
- Meilleure hiérarchie visuelle (Fraunces serif pour titres)
- Cohérence des couleurs (or, terracotta, olive, crème)
- Feedback utilisateur (hover, active states)
- Animations délais échelonnées (stagger)
- Espacement cohérent

---

## 📱 Responsive Breakpoints

| Écran | Largeur | Comportement |
|-------|---------|--------------|
| **Mobile** | < 640px | Nav horizontale (bas), 1 colonne |
| **Tablet** | 640-1024px | Nav latérale réduite, 2 colonnes |
| **Desktop** | > 1024px | Nav latérale complète, 3 colonnes |

---

## 🚀 Intégration Backend (Prochaine étape)

### Points de connexion

```javascript
// À implémenter dans chaque écran

// 1. Authentification
const apiUrl = 'http://localhost:3001/api';
const token = localStorage.getItem('token');

// 2. Charger données utilisateur
fetch(`${apiUrl}/auth/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
})

// 3. Récupérer l'arbre
fetch(`${apiUrl}/arbres/${treeId}`)

// 4. Ajouter une personne
fetch(`${apiUrl}/personnes`, {
  method: 'POST',
  body: JSON.stringify({ nom, prenom, arbreId, ... })
})

// 5. Ajouter un souvenir
fetch(`${apiUrl}/souvenirs`, {
  method: 'POST',
  body: JSON.stringify({ titre, description, categorie, ... })
})
```

### Endpoints à implémenter (depuis le backend)

```
POST   /api/auth/register          — Inscription
POST   /api/auth/login             — Connexion
GET    /api/auth/me                — Profil utilisateur
POST   /api/arbres                 — Créer un arbre
GET    /api/arbres/:id             — Récupérer un arbre
GET    /api/personnes              — Lister les personnes
POST   /api/personnes              — Ajouter une personne
GET    /api/relations-familiales   — Relations
POST   /api/souvenirs              — Ajouter un souvenir
GET    /api/souvenirs              — Lister les souvenirs
POST   /api/membres-arbre          — Inviter collaborateur
```

---

## 📊 Architecture des données

### Modèle Prisma référence

Voir `griot-backend/prisma/schema.prisma` pour:
- `Utilisateur` — Comptes utilisateurs
- `Arbre` — Arbres généalogiques
- `Personne` — Individus dans l'arbre
- `Souvenir` — Histoires, traditions
- `MembreArbre` — Collaborateurs et permissions
- `RelationsFamiliales` — Liens de parenté

---

## 🛠️ Utilisation locale

### Option 1: Fichier HTML autonome
```bash
# Simplement ouvrir dans le navigateur
open griot-backend/public/griot-app.html
```

### Option 2: Servir via backend
```bash
cd griot-backend
npm install
npm run start:dev

# Accéder à http://localhost:3001/griot-app.html
```

---

## 🎨 Système de design

### Couleurs
```css
--cream: #f6efe1          /* Fond principal (crème) */
--paper: #fffbf3          /* Cartes (papier) */
--ink: #2b1b12            /* Texte principal */
--ink-soft: #5b4636       /* Texte secondaire */
--gold: #c9932e           /* Accent (or) */
--terracotta: #b5502a     /* Accent secondaire (terracotta) */
--olive: #4b5d3b          /* Accent vert (olive) */
--line: #e3d5b8           /* Bordures */
```

### Typo
```css
Serif (Fraunces): Titres, headers
Sans (Work Sans): Corps, UI
```

---

## ✅ Checklist développement

- [x] Design responsive mobile/tablet/desktop
- [x] Supprimer écrans de démo
- [x] Modales et formulaires
- [x] Navigation fluide
- [x] Animations
- [ ] Connecter authentification
- [ ] Charger données de l'API
- [ ] Persistance (localStorage pour démo)
- [ ] Upload fichiers (photos, audio)
- [ ] Visualiseur d'arbre généalogique
- [ ] Cartographie des migrations
- [ ] Mode hors ligne

---

## 📝 Notes pour l'équipe dev

1. **React 18** — Via CDN (pas de build)
2. **Lucide icons** — SVG inline dans le code
3. **Pas de Tailwind** — CSS custom properties pour flexibilité
4. **Fichier unique** — Facilite le partage et test

Pour convertir en projet NPM:
```bash
# Créer une app React moderne avec Vite
npm create vite@latest griot-frontend -- --template react
# Copier la structure CSS et composants du HTML
```

---

## 🔐 Sécurité à implémenter

- [ ] JWT tokens (auth guard)
- [ ] RBAC (role-based access control)
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Chiffrement données sensibles
- [ ] Audit logs

---

## 📞 Support

Pour des questions sur le MVP ou l'intégration backend:
- Voir `GRIOT-Conception-SI.md` (architecture)
- Voir `griot-backend/README.md` (setup)
