# Vérifier GRIOT avec des arbres publics fictifs

Les exemples sont publics sans connexion, en lecture seule, à partir de `#/demonstrations`. Ils utilisent les composants réels de généalogie, de carte Leaflet et de récit historique. Ils ne rendent pas publics les profils des arbres d’utilisateurs : les jeux de données fictifs sont distincts, embarqués dans l’application, sans compte de démonstration ni insertion de faux membres dans PostgreSQL.

| Exemple | Lien | Vérifications attendues |
| --- | --- | --- |
| Deux pays, trois générations | https://griot-frontend-teal.vercel.app/#/demonstrations/ethiopie-cameroun | Trois liaisons individuelles ; filtre Nadir : une liaison. Repère Éthiopie 1984–1986 sans cause de départ affirmée. |
| Une famille, quatre horizons | https://griot-frontend-teal.vercel.app/#/demonstrations/diaspora | Quatre branches séparées, du Gabon vers Londres, Berlin, Madrid et Shanghai ; aucun trajet reliant les frères et sœurs entre eux. |
| Les traces incomplètes | https://griot-frontend-teal.vercel.app/#/demonstrations/incertitudes | Une seule liaison cartographique fiable (Paris, France → Paris au Texas). Un lieu daté sans position interrompt le tracé ; un lieu sans date reste à part ; les présences d’Alix à même date ne sont pas ordonnées arbitrairement. |
| Partir, puis revenir | https://griot-frontend-teal.vercel.app/#/demonstrations/retour-haiti | Cinq liaisons pour l’ensemble de la famille ; Ari : aller-retour Haïti → France → Haïti. Le séisme de 2010 ne doit pas devenir la cause affirmée du départ ni être affecté à une arrivée après sa période. |

Les personnes, biographies, liens, dates de naissance et présences individuelles sont inventés. Les lieux et événements du catalogue sont réels. Les langues déclarées dans ces scénarios sont des données fictives explicites : elles ne sont pas attribuées à tous les habitants d’un pays. Aucun contrôle d’écriture, invitation ou publication n’est offert aux visiteurs.

Les récits suivent les présences datées d’une seule personne. Des lieux différents à une même date indiquent un ordre à clarifier, pas nécessairement une erreur : un déplacement le même jour reste possible. Sans précision, aucune liaison ne part de ces présences et aucun récit de déplacement ne les ordonne. La carte conserve les points pour permettre de les examiner.

Les repères historiques sont recherchés dans le pays du premier repère pendant l’intervalle ; pour le pays d’arrivée, l’événement doit encore couvrir la date d’arrivée. Cela évite d’associer automatiquement une catastrophe passée à une personne dont la première présence connue dans ce pays est plus tardive. La portée nationale/régionale du repère reste à vérifier ; aucune causalité personnelle n’est déduite.

Chaque exemple expose une liste de points à contrôler. Les tests automatisés comparent les liaisons et les contextes aux attentes explicites du jeu de données, vérifient les retours, les homonymes et les dates ambiguës. Le test navigateur ouvre les quatre exemples sans jeton ni réponses API simulées, utilise la carte réelle, compte les liaisons, filtre et rejoue les étapes et vérifie l’absence de requêtes d’écriture. Les anciennes données et médias privés ne sont jamais utilisés dans ces scénarios.
