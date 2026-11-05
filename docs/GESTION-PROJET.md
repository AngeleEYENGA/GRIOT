# Organiser le projet GRIOT dans GitLab

## Références et transition

- Projet de gestion : https://gitlab.com/AngeleEYENGA/griot
- Projet GitLab : `88388452`, privé lors de la vérification du 5 novembre 2026.
- Dépôt de livraison actuel : https://github.com/AngeleEYENGA/GRIOT
- Site : https://griot-frontend-teal.vercel.app/
- Base produit vérifiée avant transition : `d74f766` (cinq initiations et quatre arbres fictifs publics).

Le projet GitLab examiné le 5 novembre contenait uniquement un README initial et les configurations SAST / Secret Detection, dans un historique distinct. L’intégration conserve ces commits et l’historique complet de GRIOT. Le README produit remplace le modèle de démarrage. Les analyses de sécurité sont conservées ; les contrôles frontend et backend sont ajoutés à la CI GitLab.

GitLab sert à organiser le travail. GitHub reste le point de déclenchement de Vercel pendant cette transition. Ne pas relier un second mécanisme de déploiement avant d’avoir défini le chemin de livraison. Les deux remotes locaux sont `gitlab` et `origin` (GitHub).

Après fusion d’une modification, récupérer la branche GitLab puis publier le même commit sur GitHub, sans réécriture d’historique :

```powershell
git fetch gitlab
git switch main
git merge --ff-only gitlab/main
git push origin main
```

Si une branche a divergé, examiner et résoudre les différences avant de publier ; ne pas utiliser de push forcé. Aucun miroir automatique ni changement d’accès n’est installé par cette procédure.

## Responsabilités

Angèle assure la direction fonctionnelle, l’architecture et les opérations. Jean Merveil porte la communication, le marketing et les échanges avec les partenaires. Les affectations aux comptes GitLab sont faites avec les membres réellement présents ; aucun compte ou engagement d’un tiers n’est créé implicitement.

## Tableau et étiquettes proposés

Colonnes : **À qualifier → Prêt → En cours → À vérifier → Terminé**. Un ticket bloqué reste dans son état avec `etat:bloque` et une raison explicite. Limiter à deux sujets simultanés par personne pour garder une recette possible.

Étiquettes de travail : `etat:a-qualifier`, `etat:pret`, `etat:en-cours`, `etat:a-verifier`, `etat:bloque` ; priorités `priorite:P0`, `priorite:P1`, `priorite:P2` ; types `type:evolution`, `type:anomalie`, `type:contenu`, `type:documentation`. Domaines : `domaine:origines`, `domaine:langues`, `domaine:hors-ligne`, `domaine:collaboration`, `domaine:livraison`. Les noms utilisent un seul deux-points et ne dépendent pas des étiquettes exclusives d’un abonnement payant.

Ces colonnes et étiquettes décrivent la configuration à matérialiser dans GitLab ; ce document seul ne prouve pas leur création.

## Jalons proposés

| Jalon | Résultat attendu | Sortie vérifiable |
| --- | --- | --- |
| M0 — Projet et traçabilité | Historiques réunis, documentation, modèles et CI | Code présent, pipeline vérifié, backlog importé une seule fois |
| M1 — Origines et récits cohérents | Recette des quatre exemples et liens de sources précis | Relevé des scénarios, erreurs corrigées, validation sur le site |
| M2 — Fang et apprentissage autonome | Parcours fang enrichi et premiers cours diaspora relus | Objectifs pédagogiques, voix documentées, relecture et recette |
| M3 — Transmission au village | Packs et synchronisation culturelle adaptés au faible réseau | Essais de coupure, reprise, stockage et conflits |
| M4 — Cercle et restitution | Collaboration enrichie et rapports de transmission | Droits, confidentialité, accessibilité et exports vérifiés |

Aucune date de livraison n’est promise avant estimation et validation des dépendances. Commencer par M0, puis la recette des origines demandée en priorité, et l’enrichissement du fang.

## Backlog prêt à importer

[backlog-gitlab.csv](backlog-gitlab.csv) contient douze tickets détaillés, avec un identifiant stable `GRIOT-PM-xxx`, priorité, jalon proposé, critères d’acceptation et preuves attendues dans la description. Aucun ticket existant n’est recréé automatiquement. Les langues et cartes déjà livrées sont décrites comme un socle à vérifier/enrichir, pas comme absentes.

Le fichier utilise les colonnes `title` et `description`. Les jalons et étiquettes sont indiqués dans le texte pour permettre un premier import sans prérequis ni action rapide implicite. Une fois leurs objets créés dans GitLab, leur affectation se fait depuis les tickets. Vérifier les identifiants avant une reprise : un nouvel import CSV crée des doublons.

Référence : [import CSV des tickets](https://docs.gitlab.com/user/project/issues/csv_import/). Les modèles versionnés dans `.gitlab/issue_templates` et `.gitlab/merge_request_templates` sont reconnus une fois présents dans la branche par défaut ([documentation GitLab](https://docs.gitlab.com/user/project/description_templates/)).

## Quand une tâche est terminée

Un ticket est **Prêt** avec un objectif, un périmètre, des critères et les dépendances identifiées. Il passe **À vérifier** avec une merge request, des contrôles et une recette réalisable. Il est **Terminé** quand les critères sont vérifiés, la documentation est à jour et, pour une évolution de l’application, le commit est livré et le comportement vérifié sur Vercel. Noter l’URL, le commit, le résultat et les limites ; une compilation locale ne vaut pas une livraison.

Pour les contenus linguistiques : nommer la variété, les sources, les réponses acceptées et le statut des voix. Pour l’histoire : séparer présences documentées, témoignages et hypothèses. Pour le hors-ligne : tester une vraie coupure et le rechargement. Pour les exports : vérifier le fichier obtenu et l’absence d’informations hors du périmètre choisi.

Les décisions d’architecture importantes sont consignées dans un document court lié au ticket : problème, choix, conséquences, date. Le présent document ne modifie ni les membres, ni la visibilité privée, ni les permissions du projet.
