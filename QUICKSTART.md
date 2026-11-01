# 🚀 GRIOT — Guide Rapide de Démarrage

**Durée:** 2 minutes  
**Difficulté:** ⭐ Très facile

---

## 1️⃣ Tester le MVP en 10 secondes

```bash
# Option A: Ouvrir simplement le fichier HTML
open griot-backend/public/griot-app.html

# Option B: Via serveur local (Python)
cd griot-backend/public
python -m http.server 8000
# Ouvrir http://localhost:8000/griot-app.html
```

✅ **Prêt !** L'application charge sans backend.

---

## 2️⃣ Tester chaque écran

| Écran | Chemin dans l'app | Status |
|-------|------------------|--------|
| 🏠 **Accueil** | Clic logo GRIOT | ✅ Responsive |
| 📊 **Dashboard** | Clic "Tableau de bord" (nav) | ✅ Responsive |
| 🌳 **Arbre généa.** | Clic "Arbre" (nav) | ✅ Responsive |
| 📚 **Mémoire** | Clic "Mémoire" (nav) | ✅ Responsive |
| 🗺️ **Carte** | Clic "Carte" (nav) | ✅ Responsive |
| 👥 **Équipe** | Clic "Équipe" (nav) | ✅ Responsive |

---

## 3️⃣ Tester responsive (3 modes)

### Mode 1: Mobile (640px)
```
F12 → Toggle device toolbar → iPhone 12
Vérifier:
  ✓ Nav en bas (horizontal)
  ✓ 1 colonne
  ✓ Pas de scroll horizontal
```

### Mode 2: Tablet (768px)
```
F12 → Responsive → 768px
Vérifier:
  ✓ Nav sur le côté (réduit)
  ✓ 2 colonnes
  ✓ Lisible
```

### Mode 3: Desktop (1440px)
```
F12 → Responsive → 1440px
Vérifier:
  ✓ Nav complète sur côté
  ✓ 3 colonnes possible
  ✓ Hover effects
```

---

## 4️⃣ Tester les modales

### Login Modal
```javascript
// Cliquer "Créer mon arbre" sur Accueil
// Ou: F12 → Console → 
// document.querySelector('.nav-item').click() 
// puis "Connexion"

// Vérifier:
✓ Modal s'ouvre
✓ Inputs focusables
✓ Ferme avec X
✓ Pas de scroll arrière-plan
```

### Add Person Modal
```javascript
// Aller à Dashboard
// Cliquer "Ajouter une personne"

// Vérifier:
✓ Modal s'ouvre
✓ 5 champs affichés
✓ Bouton "Ajouter" actif
✓ Ferme correctement
```

### Invite Collaborator
```javascript
// Aller à Équipe
// Cliquer "Inviter"

// Vérifier:
✓ Formulaire d'invitation
✓ 2 inputs + select
✓ Envoi possible
```

---

## 5️⃣ Architecture fichiers

```
griot-backend/public/
├── griot-app.html          ← APP PRINCIPALE (ouvrir ici)
├── griot-mvp.html          ← Version minimale (optionnel)
├── griot-api.js            ← Module API (à inclure)
├── README-MVP.md           ← Guide complet
└── INTEGRATION-API.md      ← Exemples intégration

racine/
├── GRIOT-MVP-LOCAL.md      ← Vue d'ensemble MVP
├── CHECKLIST.md            ← Tests de validation
└── RAPPORT-LIVRAISON.md    ← Résumé exécutif
```

---

## 6️⃣ Connecter au backend (quand prêt)

### Étape 1: Démarrer le backend
```bash
cd griot-backend
npm install
npm run start:dev
# Écoute sur http://localhost:3001
```

### Étape 2: Inclure le module API
```html
<!-- Dans griot-app.html, ajouter avant </body>: -->
<script src="griot-api.js"></script>
```

### Étape 3: Tester la connexion
```javascript
// F12 → Console
const api = new GriotAPI('http://localhost:3001/api');

// Tester:
await api.auth.login('test@example.com', 'password123');
await api.trees.list();
await api.persons.create('tree-id', { nom: 'Mvondo', prenom: 'Jean' });
```

---

## 7️⃣ Parcours utilisateur typique

```
1. Ouvrir griot-app.html
   ↓
2. Voir Accueil (responsive, 4 cartes)
   ↓
3. Cliquer "Créer mon arbre"
   ↓
4. Modal login (préparée pour API)
   ↓
5. Accès Dashboard (mock data)
   ↓
6. Tester "Ajouter une personne"
   ↓
7. Naviguer autres écrans
   ↓
8. Essayer sur mobile (DevTools)
   ↓
9. Consulter INTEGRATION-API.md pour code real
```

---

## ⚡ Raccourcis clavier

```
F12                    → DevTools
Ctrl+Shift+M           → Responsive mode (Chrome)
Cmd+Option+I           → DevTools (Mac)
Escape                 → Fermer modales
Tab                    → Navigation clavier
```

---

## 🎯 Points clés à comprendre

| Point | Explication |
|-------|-------------|
| **Sans backend** | App fonctionne standalone pour démo |
| **LocalStorage** | Token JWT sauvegardé (quand API active) |
| **Responsive** | Auto-ajuste mobile/tablet/desktop |
| **Modales** | Prêtes pour intégration API |
| **Module API** | Patterns documentés dans INTEGRATION-API.md |
| **Pas de démos** | Écrans inutiles supprimés (charte, démo multi-screen) |

---

## ❓ FAQ Rapide

### Q: Pourquoi 2 fichiers HTML?
**A:** `griot-mvp.html` = minimal, `griot-app.html` = complet avec modales. Choisir app.html.

### Q: Ça fonctionne sans backend?
**A:** Oui! Mock data affichée. Prêt à connecter avec griot-api.js

### Q: Comment ajouter un arbre?
**A:** Dashboard → "Ajouter une personne" (modal prête pour API)

### Q: C'est mobile-friendly?
**A:** Oui! DevTools → Responsive → 390px pour voir mobile

### Q: Comment connecter l'API?
**A:** Voir INTEGRATION-API.md pour 10+ exemples complets

### Q: Les démos sont supprimées?
**A:** Oui ✓ Plus de "Charte graphique" ni "Démo multi-écrans"

---

## 🔗 Fichiers de référence

```
Documentation:
├── README-MVP.md              (Start here ← TU ES ICI)
├── GRIOT-MVP-LOCAL.md         (Architecture complète)
├── INTEGRATION-API.md         (Patterns API)
├── CHECKLIST.md               (Tests validation)
└── RAPPORT-LIVRAISON.md       (Résumé exécutif)

Code:
├── griot-app.html             (App principale)
├── griot-mvp.html             (Version réduite)
└── griot-api.js               (Module API)
```

---

## ✅ Prochaines étapes

### Maintenant
1. ✅ Ouvrir `griot-app.html` dans le navigateur
2. ✅ Tester chaque écran
3. ✅ Vérifier responsive (F12 mobile)

### Ensuite (quand prêt)
1. ⏳ Démarrer backend NestJS
2. ⏳ Connecter griot-api.js
3. ⏳ Implémenter authentification réelle

### Plus tard
1. ⏳ Ajouter visualiseurs (D3.js, Leaflet)
2. ⏳ Upload média (photos, audio)
3. ⏳ Mode offline avec Service Worker

---

## 📞 Besoin d'aide?

### Bug ou problème?
1. Vérifier console (F12)
2. Consulter CHECKLIST.md
3. Relire INTEGRATION-API.md

### Questions architecture?
→ Voir GRIOT-Conception-SI.md

### Questions backend?
→ Voir griot-backend/README.md

### Questions API?
→ Voir INTEGRATION-API.md (10+ exemples)

---

## 🎉 C'est tout!

**Vous êtes prêt à:**
- ✅ Tester le MVP localement
- ✅ Montrer aux stakeholders
- ✅ Commencer l'intégration backend
- ✅ Itérer et améliorer

**Bon développement! 🚀**

---

**Créé:** 7 août 2026  
**Durée lue:** ~3 min  
**Prêt:** OUI ✅
