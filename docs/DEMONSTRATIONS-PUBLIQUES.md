# Familles publiques pour découvrir GRIOT

Les quatre scénarios sont de vrais arbres enregistrés dans la base GRIOT, administrés par un compte de test à connexion classique (email et mot de passe, sans Google). Les identifiants sont remis à la responsable du projet et restent hors du dépôt. La mention « compte local » désigne ce mode d’authentification ; pour être visibles sur le site Vercel, les arbres doivent être enregistrés sur son API de production.

Ils apparaissent dès l’accueil, après **Une histoire de famille vous attend**. Chaque carte ouvre `#/arbres-publics/<identifiant>` avec trois rubriques : généalogie, origines et récits, langues et premiers pas. Aucun compte n’est requis pour consulter cette présentation. Le visiteur ne peut pas modifier l’arbre. Le propriétaire retrouve les mêmes données dans son espace familial connecté.

L’ancienne page `#/demonstrations` et son lien de pied de page sont retirés. Les anciennes adresses reviennent à l’accueil. Le frontend ne contient plus les jeux de données comme source de la présentation publique : il lit les données de l’API.

## Scénarios et recette

| Famille | Vérifications attendues |
| --- | --- |
| Deux pays, trois générations | Trois liaisons individuelles ; filtre Nadir : une liaison. Repère Éthiopie 1984–1986 sans cause de départ affirmée. |
| Une famille, quatre horizons | Quatre branches séparées du Gabon vers Londres, Berlin, Madrid et Shanghai ; anglais, allemand, espagnol et mandarin proposés, fang déclaré distinct. |
| Les traces incomplètes | Une liaison fiable Paris, France → Paris au Texas. Un lieu daté sans coordonnées interrompt le tracé ; les étapes sans date restent à part ; les présences simultanées d’Alix ne sont pas ordonnées arbitrairement. |
| Partir, puis revenir | Cinq liaisons pour la famille ; Ari : aller-retour Haïti → France → Haïti. Le séisme de 2010 n’est pas présenté comme une cause individuelle certaine ni attribué à une première arrivée après sa période. |

Les personnages, biographies, relations et dates individuelles sont fictifs. Les lieux et événements historiques cités sont réels ; leur présence n’établit pas le motif d’un déplacement personnel. Le compte de test contient uniquement ces données fictives.

## Accès public et confidentialité

La recherche historique `GET /api/arbres/publics` reste limitée au nom et aux effectifs. La nouvelle liste `GET /api/arbres/presentations` et la consultation `GET /api/arbres/presentations/:id` exigent à la fois `visibilite=public` et `presentationPublique=true`. Cette seconde autorisation vaut `false` pour les anciens arbres. Un arbre privé ou public sans cette autorisation ne livre pas ses fiches détaillées.

Seuls les champs de présentation des personnes, les relations internes à cet arbre et les étapes géographiques sont sélectionnés. Les comptes, emails, membres, conversations, souvenirs privés, preuves et médias ne font pas partie de la réponse publique. Créer une présentation détaillée est une publication explicite de ces champs ; les quatre familles fictives ont cette autorisation.

Les cours publics sauvegardent uniquement une progression locale au navigateur, distincte des comptes connectés. La voix de synthèse dépend de l’appareil et les médias externes se chargent sur action du visiteur. Aucun mot de passe de test n’est publié sur l’accueil ou dans le code.

## Préparation reproductible

Les scénarios source et leurs attentes de cohérence sont conservés pour la recette dans `scripts/fixtures/publicTrees.js`. Ils ne sont pas importés par les pages de production.

Après déploiement de la migration `20261105160000_public_tree_presentations`, exécuter explicitement le script vers l’API choisie :

```powershell
node scripts/create-public-introduction.mjs https://griot-backend-bice.vercel.app/api "$env:TEMP/griot-introduction-account.json"
```

Le script génère les identifiants une seule fois, les conserve dans le fichier indiqué hors du dépôt, puis réutilise ce compte lors d’une reprise. Il crée les arbres, personnes, relations et lieux manquants et vérifie les effectifs via les présentations publiques. Il ne supprime aucun arbre utilisateur et n’affiche ni mot de passe ni jeton. Un fichier voisin `.trees.json` relève les identifiants des quatre arbres ; lui aussi reste hors du dépôt. Réutiliser le même fichier de compte pour éviter la création d’un autre compte lors d’une reprise.
