# Phase 4 — Passages, affirmations et provenance

État : préparation du prochain lot. La phase Sources est livrée ; les éléments ci-dessous ne sont pas encore implémentés.

## Premier incrément : saisie manuelle privée

Réutiliser `Source`, `VersionSource`, les appartenances actives et le journal existants. Ajouter un passage court, saisi par une personne autorisée, avec un repère explicite (page, section ou timecode), sa langue et les conditions autorisant sa conservation. La personne distingue une transcription d’une reformulation ; une reformulation ne s’affiche jamais entre guillemets comme un extrait exact.

Le passage référence une version précise de la source par une contrainte composée en base. Sa provenance est « saisie humaine », avec auteur et date d’enregistrement ; sa présence ne signifie ni extraction automatique, ni consultation par GRIOT, ni validation scientifique. Un passage sans droits de conservation établis n’est pas copié : seule une référence avec repère peut être conservée.

Une affirmation est une proposition distincte du passage : texte, qualification (déclaration familiale, hypothèse ou contexte documentaire), limites, auteur et état de relecture. Chaque révision conserve les appuis et contradictions vers des passages précis. Une référence bibliographique seule ne devient pas un appui textuel. L’absence d’appui reste visible.

## Contrats et intégrité à réaliser

- Création de passages sous une source accessible, lecture paginée et retrait motivé sans suppression silencieuse de l’historique.
- Création d’une affirmation dans l’arbre, puis révisions immuables avec motif et contrôle de concurrence.
- Lien d’appui qualifié : soutien, contradiction ou contexte. Deux formulations incompatibles restent consultables ; aucun vote ne les transforme automatiquement en vérité.
- Chaque lien vérifie l’accès à l’affirmation et au passage. Pour ce premier incrément privé, les deux doivent appartenir au même arbre ; aucune promotion vers le corpus éditorial public.
- Les extraits d’anciennes versions restent liés à ces versions. Une modification de métadonnées ne les réattribue pas à la nouvelle version et impose un avertissement de relecture.
- Pagination, limites de texte, clés de reprise contre les doubles soumissions et journal transactionnel sur chaque mutation. Les limites exactes sont fixées dans les DTO et la recette avant migration.

## Droits et interface

Le lecteur consulte les éléments privés de son arbre actif. Un contributeur propose ses propres éléments ; un éditeur ou administrateur familial peut les relire dans ce même arbre. Une relecture familiale ne porte pas le libellé « vérifié scientifiquement ». Les habilitations documentaires globales restent séparées.

Dans Sources documentaires, la fiche affichera ses passages, leur repère et leur version, puis les affirmations qui les utilisent. Toute citation doit pouvoir rouvrir le passage avec un nouveau contrôle d’accès. Les contradictions et limites sont affichées près de l’affirmation.

## Dépendances et exclusions

Migration additive après présentation du schéma physique ; aucune nouvelle dépendance externe nécessaire pour la saisie manuelle. Pas de téléchargement de PDF, d’OCR, de fournisseur IA ou de traitement long dans cet incrément. Un futur corpus éditorial nécessite une sélection explicite, des droits vérifiés et des relecteurs désignés ; aucun corpus de référence n’est inventé à partir des arbres fictifs.

La recherche/RAG et les connexions aux récits Origins, aux cours Language et aux fiches Peoples restent des lots ultérieurs. Le présent incrément ne remplace pas les données actuellement utilisées par ces modules.

## Recette de sortie

1. Passage lié à la bonne source/version ; lien vers une version d’une autre source rejeté par la base.
2. Hors famille, membre retiré et lien direct : aucune fuite de titre, texte, repère ou décompte.
3. Droits insuffisants : pas de copie de texte ; référence seule identifiable comme telle.
4. Affirmation et contradiction conservées avec leurs appuis, qualifications et versions.
5. Révision concurrente refusée ; double soumission sans duplication ; audit en échec annulant toute la transaction.
6. Source modifiée ou archivée : ancienne citation conservée avec avertissement, sans substitution silencieuse.
7. Injection de champs de validation/publication refusée ; texte importé affiché sans exécution.
8. Parcours navigateur réel sur base locale, rôle lecteur, mobile et non-régression des arbres publics.
