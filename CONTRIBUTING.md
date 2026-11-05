# Contribuer à GRIOT

La gestion du travail est centralisée dans [le projet GitLab](https://gitlab.com/AngeleEYENGA/griot). Le dépôt GitHub reste relié aux déploiements Vercel pendant la transition. Voir [l’organisation et les jalons](docs/GESTION-PROJET.md).

1. Partir d’un ticket avec un objectif concret, les rôles concernés et des critères vérifiables. Choisir le modèle évolution, anomalie ou contenu pédagogique.
2. Créer une branche courte : `feat/<numero>-sujet`, `fix/<numero>-sujet` ou `docs/<numero>-sujet`.
3. Réaliser une modification ciblée, documenter les décisions et utiliser des personnes fictives pour les essais.
4. Ouvrir une merge request liée au ticket. Indiquer les contrôles réellement exécutés, les limites et les éventuelles étapes de migration.
5. Après fusion, synchroniser le même historique avec GitHub pour la livraison Vercel. Vérifier le commit déployé et le parcours sur le site avant de fermer la recette.

## Contrôles locaux

Depuis la racine du dépôt, sous PowerShell :

```powershell
Set-Location griot-frontend
npm.cmd ci
npm.cmd run lint
npm.cmd test
npm.cmd run build
Set-Location ../griot-backend
npm.cmd ci
npm.cmd run prisma:generate
npm.cmd run build
npm.cmd test -- --runInBand
Set-Location ..
```

Les exemples de variables sont dans les `.env.example`. Les tests et la compilation ne prouvent pas une migration de production ni le fonctionnement d’un microphone, du GPS ou d’une voix sur un appareil réel. La CI utilise une URL PostgreSQL de test, jamais les identifiants de production.

## Documentation et contenus

Le [README](README.md) décrit le produit actuel ; [l’index documentaire](docs/README.md) oriente vers les documents détaillés. Distinguer les fonctions disponibles, les initiations partielles et les évolutions prévues. Pour une langue ou un récit historique, conserver les références, la variété, la période et les incertitudes. Une suggestion géographique ne détermine pas une langue maternelle, une ethnie ou le motif d’une migration.

Ne pas ajouter au dépôt les `.env`, secrets, exports familiaux ni enregistrements privés. Les fichiers de conception fournis localement ne sont pas publiés automatiquement.
