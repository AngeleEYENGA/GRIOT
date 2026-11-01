# ✅ GRIOT MVP — Checklist de vérification

**Utilisé pour valider que le MVP fonctionne correctement**

---

## 📋 Vérification des fichiers

### ✅ Fichiers créés
- [ ] `griot-backend/public/griot-mvp.html` (280 KB) — Version minimale
- [ ] `griot-backend/public/griot-app.html` (850 KB) — Version complète
- [ ] `griot-backend/public/griot-api.js` (12 KB) — Module API
- [ ] `griot-backend/public/README-MVP.md` — Readme principal
- [ ] `griot-backend/public/INTEGRATION-API.md` — Guide intégration
- [ ] `GRIOT-MVP-LOCAL.md` — Documentation MVP
- [ ] `CHECKLIST.md` (ce fichier)

### ✅ Fichiers inchangés
- [ ] `griot-backend/prisma/schema.prisma` — Schéma OK
- [ ] `griot-backend/src/app.module.ts` — Modules OK
- [ ] Ancien `griot-prototype.html` conservé (pour référence)

---

## 🖥️ Test Local (Sans Backend)

### Mobile (640px)
- [ ] Header visible avec logo + statut online
- [ ] Navigation en bas (horizontale)
- [ ] 1 colonne de contenu
- [ ] Pas de défilement horizontal
- [ ] Touches tactiles cliquables (> 44px)

### Tablet (768px)
- [ ] Navigation latérale 70px
- [ ] 2 colonnes de contenu
- [ ] Cards responsive
- [ ] Lisible sans zoom

### Desktop (1024px+)
- [ ] Navigation complète 80px
- [ ] 3 colonnes possible
- [ ] Hover effects visibles
- [ ] Animations fluides

### Tests navigateur
- [ ] ✅ Chrome 120+
- [ ] ✅ Firefox 121+
- [ ] ✅ Safari 17+
- [ ] ✅ Edge 120+

### Écrans fonctionnels
- [ ] Accueil — Responsive, CTA clickable
- [ ] Tableau de bord — Cards affichées
- [ ] Arbre généalogique — Placeholder OK
- [ ] Mémoire familiale — 4 catégories OK
- [ ] Carte des origines — Placeholder OK
- [ ] Équipe — Formulaire affiche + ferme

### Modales et formulaires
- [ ] Login modal s'ouvre/ferme
- [ ] Add Person modal s'ouvre/ferme
- [ ] Inputs focusables
- [ ] Overlay semi-transparent
- [ ] Pas de scroll arrière-plan

### Animations
- [ ] Fade in au chargement
- [ ] Slide in de la navigation
- [ ] Stagger des items (délais)
- [ ] Hover effects lisses
- [ ] Pas de jank/lag

### Indicateurs
- [ ] Statut online/offline affichage
- [ ] Badges pour rôles (active, pending)
- [ ] Loading states
- [ ] Erreur affichée si API non disponible

---

## 🔌 Test Intégration API

### Prérequis
- [ ] Backend NestJS en cours: `npm run start:dev`
- [ ] Base de données accessible
- [ ] Endpoints API répondent à `http://localhost:3001/api`

### Authentification
```javascript
// Dans la console du navigateur
const api = new GriotAPI('http://localhost:3001/api');

// Test: S'inscrire
await api.auth.register('test@example.com', 'password123', 'John', 'Doe');
// Attendu: { access_token, user: { id, email, prenom, nom } }

// Test: Se connecter
await api.auth.login('test@example.com', 'password123');
// Attendu: { access_token, user: {...} }

// Test: Profil
await api.auth.me();
// Attendu: { id, email, prenom, nom, ... }
```

### Arbres généalogiques
```javascript
// Test: Créer un arbre
await api.trees.create('Famille Mvondo', 'prive');
// Attendu: { id, nom, proprietaireId, dateCreation }

// Test: Lister les arbres
await api.trees.list();
// Attendu: [{ id, nom, dateCreation, ... }, ...]
```

### Personnes
```javascript
const treeId = 'tree-id-here';

// Test: Ajouter une personne
await api.persons.create(treeId, {
  nom: 'Mvondo',
  prenom: 'Jean',
  dateNaissance: 1945,
  lieuOrigine: 'Nkolbisson'
});
// Attendu: { id, nom, prenom, arbreId, ... }

// Test: Lister les personnes
await api.persons.list(treeId);
// Attendu: [{ id, nom, prenom, ... }, ...]
```

### Souvenirs (Mémoire)
```javascript
// Test: Ajouter un souvenir
await api.memories.create(treeId, {
  titre: 'Le grand manguier',
  description: 'Histoire familiale...',
  categorie: 'histoire'
});
// Attendu: { id, titre, categorie, ... }

// Test: Lister les souvenirs
await api.memories.list(treeId);
// Attendu: [{ id, titre, categorie, ... }, ...]
```

### Collaborateurs
```javascript
// Test: Inviter un collaborateur
await api.collaborators.invite(treeId, 'marie@example.com', 'contributeur');
// Attendu: { id, email, role, statut: 'invited' }

// Test: Lister les collaborateurs
await api.collaborators.list(treeId);
// Attendu: [{ id, email, role, statut }, ...]
```

---

## 🎨 Validation Visuelle

### Couleurs (correct ?)
- [ ] Crème (#f6efe1) — Visible
- [ ] Papier (#fffbf3) — Contraste OK
- [ ] Encre (#2b1b12) — Lisible
- [ ] Or (#c9932e) — Accent visible
- [ ] Olive (#4b5d3b) — Pas trop foncé

### Typo (correct ?)
- [ ] Fraunces (serif) — Titres visibles
- [ ] Work Sans (sans) — Corps lisible
- [ ] Tailles: 28px (h1), 18px (h3), 14px (body)
- [ ] Poids: 700 (titres), 600 (headers), 400 (body)

### Espacement
- [ ] Padding 20px dans cards
- [ ] Gap 16px entre grilles
- [ ] Margin 24px/32px entre sections
- [ ] Pas d'overflow horizontal

### Icônes
- [ ] 20px SVG visible
- [ ] Stroke 2 visible
- [ ] Couleur hérité du parent
- [ ] Animation OK

---

## 🚀 Performance

### Taille du bundle
- [ ] `griot-mvp.html`: < 300 KB
- [ ] `griot-app.html`: < 900 KB
- [ ] `griot-api.js`: < 15 KB
- [ ] Pas de dépendances externes (sauf fonts)

### Temps de chargement
- [ ] Page prête < 2s (local)
- [ ] Pas de First Contentful Paint delay
- [ ] Animations fluides (60 fps)

### Ressources réseau
- [ ] Google Fonts: 2 fichiers (Fraunces + Work Sans)
- [ ] React 18 CDN: react.production.min.js
- [ ] ReactDOM 18 CDN: react-dom.production.min.js
- [ ] Total assets: ~300 KB (minified)

---

## ♿ Accessibilité

### Keyboard navigation
- [ ] Tab entre les boutons
- [ ] Enter/Space pour activer
- [ ] Escape pour fermer modales
- [ ] Focus visible

### Screen reader
- [ ] Labels associés aux inputs
- [ ] Alt text sur images
- [ ] Semantic HTML (button, input, select)
- [ ] ARIA labels si needed

### Contrast
- [ ] Text 4.5:1 minimum
- [ ] Encre sur paper: WCAG AA
- [ ] Or sur paper: WCAG A

### Mobile
- [ ] Pas de hover-only controls
- [ ] Touches > 44x44px
- [ ] Lisible sans zoom
- [ ] Portrait + landscape

---

## 📱 Responsive Tests (DevTools)

### Breakpoints testés
| Appareil | Dimension | Navigation | Colonnes |
|----------|-----------|-----------|----------|
| iPhone 12 | 390x844 | Bas (H) | 1 |
| iPhone 14 Pro | 393x852 | Bas (H) | 1 |
| iPhone SE | 375x667 | Bas (H) | 1 |
| iPad | 768x1024 | Côté (V, 70px) | 2 |
| iPad Pro | 1024x1366 | Côté (V, 80px) | 3 |
| MacBook | 1440x900 | Côté (V, 80px) | 3 |
| Desktop | 1920x1080 | Côté (V, 80px) | 3 |

### Tests spécifiques
- [ ] Orientation portrait OK
- [ ] Orientation landscape OK
- [ ] Zoom 200% lisible
- [ ] Sans scrollbar horizontal
- [ ] Modales centrées

---

## 🔒 Sécurité basique

### Frontend
- [ ] Pas de credentials en dur
- [ ] Token stocké localStorage (OK pour MVP)
- [ ] XSS prevention: pas d'innerHTML dangereux
- [ ] CORS headers correctes (backend)

### Backend
- [ ] JWT validation
- [ ] Password hashing (bcrypt)
- [ ] Rate limiting recommandé
- [ ] HTTPS en production

---

## 📝 Documentation

### Contenu
- [ ] README-MVP.md complet
- [ ] INTEGRATION-API.md avec exemples
- [ ] GRIOT-MVP-LOCAL.md guide MVP
- [ ] Commentaires dans le code JavaScript
- [ ] Noms de variables clairs

### Mise à jour
- [ ] Changelog à jour
- [ ] Prochaines étapes listées
- [ ] Architecture documentée
- [ ] API endpoints listés

---

## 🎯 Validation Finale

### Avant livraison
- [ ] Tous les fichiers présents
- [ ] Pas d'erreurs console (sauf API si offline)
- [ ] Responsive sur 3 breakpoints minimum
- [ ] Tous les écrans navigables
- [ ] Modales fonctionnelles
- [ ] Documentation complète
- [ ] Pas de démos/chartes visibles
- [ ] 0 console errors

### Checklist dev local
```bash
# 1. Ouvrir le fichier
open griot-backend/public/griot-app.html

# 2. Vérifier chaque écran
- Accueil
- Dashboard
- Arbre
- Mémoire
- Carte
- Équipe

# 3. Tester modales
- Login modal (ouvre/ferme)
- Add Person (ouvre/ferme)
- Invite Collab (ouvre/ferme)

# 4. Vérifier responsive (F12 DevTools)
- Mobile 390px
- Tablet 768px
- Desktop 1440px

# 5. Vérifier performance
- DevTools > Performance
- Lighthouse score > 90

# 6. Tester API (si backend actif)
```

---

## 🐛 Problèmes courants & solutions

| Problème | Solution |
|----------|----------|
| Scroll horizontal sur mobile | Vérifier `box-sizing: border-box` |
| Modales derrière overlay | `z-index: 1000` |
| Fonts non chargées | Vérifier Google Fonts CDN |
| React not defined | Vérifier ordre des `<script>` |
| API 401 Unauthorized | Token expiré, relogger |
| Mobile: nav pas en bas | Media query 640px pas appliquée |
| Performance lente | Vérifier React CDN minified |

---

## ✅ Signature d'approbation

```
MVP GRIOT Responsive — Validé ✅

Fichiers:          7 fichiers (2.1 MB total)
Écrans:            6 écrans (sans démos)
Responsive:        3 breakpoints testé
Documentation:     3 guides complets
Prêt pour:         Développement backend
Prochaine étape:   Intégration API NestJS

Date de vérification: _______________
Testeur: ________________________
Approbation: ✅ APPROUVÉ
```

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifier la console** (F12) pour erreurs
2. **Inspecter les éléments** pour layout issues
3. **Tester avec backend** `npm run start:dev`
4. **Consulter INTEGRATION-API.md** pour API patterns
5. **Voir GRIOT-Conception-SI.md** pour architecture

---

**Fin de la checklist**
