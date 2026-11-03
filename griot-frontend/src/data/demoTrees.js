const person = (id, prenom, dateNaissance, villageOrigine) => ({ id, prenom, nom: 'Démonstration', dateNaissance, villageOrigine, biographie: 'Personnage fictif créé uniquement pour tester GRIOT. Les lieux sont réels ; les liens, présences et dates individuelles sont inventés.' });
const relation = (id, personneId1, personneId2, typeRelation) => ({ id, personneId1, personneId2, typeRelation });
const place = {
  addis: ['Addis-Abeba', 'Éthiopie', 9.03, 38.74], yaounde: ['Yaoundé', 'Cameroun', 3.848, 11.502], libreville: ['Libreville', 'Gabon', .392, 9.454],
  london: ['Londres', 'Royaume-Uni', 51.507, -.128], berlin: ['Berlin', 'Allemagne', 52.52, 13.405], madrid: ['Madrid', 'Espagne', 40.416, -3.704], shanghai: ['Shanghai', 'Chine', 31.23, 121.474],
  paris: ['Paris', 'France', 48.857, 2.352], texas: ['Paris (Texas)', 'États-Unis', 33.661, -95.556], haiti: ['Port-au-Prince', 'Haïti', 18.594, -72.307], village: ['Village à retrouver', 'Cameroun', null, null],
};
const step = (id, personneId, key, dateEvenement, ordre = 0) => { const [nom, pays, latitude, longitude] = place[key]; return { id, personneId, dateEvenement, ordre, lieu: { nom, pays, latitude, longitude } }; };
export const demoTrees = [
  {
    id: 'demo-ethiopie-cameroun', slug: 'ethiopie-cameroun', nom: 'Deux pays, trois générations', visibilite: 'public', demonstration: true,
    summary: 'Un passage Éthiopie–Cameroun et deux générations suivantes. Un événement national peut éclairer la période sans prouver le motif du départ.',
    people: [person('e1', 'Nadir', '1950-02-10', 'Addis-Abeba'), person('e2', 'Mina', '1955-06-18', 'Addis-Abeba'), person('e3', 'Alex', '1980-07-09', 'Addis-Abeba'), person('e4', 'Camille', '1982-09-11', 'Yaoundé'), person('e5', 'Noa', '2007-05-12', 'Yaoundé')],
    relations: [relation('er1', 'e1', 'e2', 'conjoint'), relation('er2', 'e1', 'e3', 'pere'), relation('er3', 'e2', 'e3', 'mere'), relation('er4', 'e3', 'e4', 'conjoint'), relation('er5', 'e3', 'e5', 'parent'), relation('er6', 'e4', 'e5', 'parent')],
    migrations: [step('ea', 'e1', 'addis', '1980-01-01'), step('eb', 'e1', 'yaounde', '1987-01-01'), step('ec', 'e2', 'addis', '1981-01-01'), step('ed', 'e2', 'yaounde', '1988-01-01'), step('ee', 'e3', 'addis', '1982-01-01'), step('ef', 'e3', 'yaounde', '1989-01-01'), step('eg', 'e4', 'yaounde', '2000-01-01'), step('eh', 'e5', 'yaounde', '2007-05-12')],
    declaredLanguages: [{ iso: 'fan', name: 'Fang', reason: 'Langue choisie dans le scénario fictif, pas déduite du nom des personnages.' }, { iso: 'amh', name: 'Amharique', reason: 'Langue déclarée pour cet exemple, et non attribuée à toute personne née en Éthiopie.' }],
    checks: ['Filtrer Nadir : une seule liaison Addis-Abeba → Yaoundé.', 'Rejouer les étapes : aucune liaison ne doit unir deux personnes différentes.', 'Le repère Éthiopie 1984–1986 peut apparaître, mais le récit ne doit pas affirmer que la famine a causé ce départ.', 'Les enfants n’héritent pas automatiquement du trajet ou de la langue d’un parent.'],
    expectedRoutes: [['ea', 'eb'], ['ec', 'ed'], ['ee', 'ef']], expectedContexts: ['ethiopie-1984'],
  },
  {
    id: 'demo-diaspora', slug: 'diaspora', nom: 'Une famille, quatre horizons', visibilite: 'public', demonstration: true,
    summary: 'Des frères et sœurs partent du Gabon vers Londres, Berlin, Madrid et Shanghai. Comparer les branches et les langues utiles à l’étranger.',
    people: [person('d1', 'Robin', '1960-01-02', 'Libreville'), person('d2', 'Sasha', '1964-03-10', 'Libreville'), person('d3', 'Léa', '1990-06-01', 'Libreville'), person('d4', 'Élie', '1992-02-02', 'Libreville'), person('d5', 'Charlie', '1994-04-04', 'Libreville'), person('d6', 'Lou', '1996-08-08', 'Libreville')],
    relations: [relation('dr0', 'd1', 'd2', 'conjoint'), ...['d3', 'd4', 'd5', 'd6'].flatMap((id) => [relation(`${id}-p`, 'd1', id, 'parent'), relation(`${id}-m`, 'd2', id, 'parent')])],
    migrations: [step('da', 'd3', 'libreville', '2010-01-01'), step('db', 'd3', 'london', '2018-09-01'), step('dc', 'd4', 'libreville', '2011-01-01'), step('dd', 'd4', 'berlin', '2019-09-01'), step('de', 'd5', 'libreville', '2012-01-01'), step('df', 'd5', 'madrid', '2020-09-01'), step('dg', 'd6', 'libreville', '2013-01-01'), step('dh', 'd6', 'shanghai', '2021-09-01')],
    declaredLanguages: [{ iso: 'fan', name: 'Fang', reason: 'Langue familiale déclarée dans cet exemple fictif.' }],
    checks: ['Afficher les quatre branches : quatre liaisons, une par personne, jamais Londres → Berlin → Madrid → Shanghai.', 'Les lieux de résidence suggèrent anglais, allemand, espagnol et mandarin, sans effacer les langues d’origine.', 'Le scénario ne contient aucune preuve de motif : le récit ne doit pas inventer études, emploi ou conflit.', 'La famille partagée n’implique pas que chaque personne parle toutes les langues proposées.'],
    expectedRoutes: [['da', 'db'], ['dc', 'dd'], ['de', 'df'], ['dg', 'dh']], expectedContexts: [],
  },
  {
    id: 'demo-incertitudes', slug: 'incertitudes', nom: 'Les traces incomplètes', visibilite: 'public', demonstration: true,
    summary: 'Dates manquantes, position inconnue, présences simultanées et villes homonymes : vérifier que GRIOT conserve les incertitudes.',
    people: [person('i1', 'Jules', '1965-03-12', 'Village à retrouver'), person('i2', 'Alix', '1968-01-09', 'Yaoundé'), person('i3', 'Morgan', '1990-11-02', 'Paris')],
    relations: [relation('ir1', 'i1', 'i2', 'conjoint'), relation('ir2', 'i1', 'i3', 'parent'), relation('ir3', 'i2', 'i3', 'parent')],
    migrations: [step('ia', 'i1', 'yaounde', '1990-01-01'), step('ib', 'i1', 'village', '2000-01-01'), step('ic', 'i1', 'paris', '2010-01-01'), step('id', 'i1', 'libreville', null), step('ie', 'i2', 'yaounde', '2005-01-01'), step('if', 'i2', 'paris', '2005-01-01'), step('ig', 'i2', 'berlin', '2010-01-01'), step('ih', 'i3', 'paris', '2012-01-01'), step('ii', 'i3', 'texas', '2016-01-01')],
    declaredLanguages: [],
    checks: ['Un lieu daté sans coordonnées ne doit pas être sauté pour dessiner une liaison directe.', 'Libreville sans date reste à part ; sa date ne doit pas être inventée.', 'Les deux présences d’Alix au même jour, dans deux pays différents, sont ambiguës : aucune liaison ne doit en découler.', 'Paris, France et Paris au Texas doivent rester distincts sur la carte et dans le récit.'],
    expectedRoutes: [['ih', 'ii']], expectedContexts: [],
  },
  {
    id: 'demo-retour-haiti', slug: 'retour-haiti', nom: 'Partir, puis revenir', visibilite: 'public', demonstration: true,
    summary: 'Un aller-retour Haïti–France avec un séisme dans l’intervalle. Distinguer chronologie, retour et cause supposée.',
    people: [person('h1', 'Ari', '1975-02-14', 'Port-au-Prince'), person('h2', 'Sam', '1978-05-15', 'Paris'), person('h3', 'Kim', '2003-06-16', 'Port-au-Prince')],
    relations: [relation('hr1', 'h1', 'h2', 'conjoint'), relation('hr2', 'h1', 'h3', 'parent'), relation('hr3', 'h2', 'h3', 'parent')],
    migrations: [step('ha', 'h1', 'haiti', '2008-01-01'), step('hb', 'h1', 'paris', '2011-01-01'), step('hc', 'h1', 'haiti', '2015-01-01'), step('hd', 'h2', 'paris', '2008-01-01'), step('he', 'h2', 'haiti', '2015-01-01'), step('hf', 'h3', 'haiti', '2008-01-01'), step('hg', 'h3', 'paris', '2011-01-01'), step('hh', 'h3', 'haiti', '2015-01-01')],
    declaredLanguages: [{ iso: 'hat', name: 'Créole haïtien', reason: 'Déclaré pour les personnages fictifs, pas inféré automatiquement de la nationalité.' }],
    checks: ['Ari possède deux liaisons : Haïti → France, puis France → Haïti.', 'Le séisme du 12 janvier 2010 peut éclairer le premier intervalle, mais pas celui de 2011 à 2015.', 'Ni le séisme ni le lien familial ne prouvent le motif personnel du départ ou du retour.', 'Le filtre individuel doit préserver le sens et l’ordre de chaque parcours.'],
    expectedRoutes: [['ha', 'hb'], ['hb', 'hc'], ['hd', 'he'], ['hf', 'hg'], ['hg', 'hh']], expectedContexts: ['haiti-2010'],
  },
].map((tree) => ({ ...tree, migrations: tree.migrations.map((migration) => ({ ...migration, personne: tree.people.find((person) => person.id === migration.personneId) })) }));
