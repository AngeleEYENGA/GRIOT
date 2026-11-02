// Editorial knowledge, reviewed against the references below. No personal ethnicity inference.
export const culturalSources = [
  { id: 'ethnie', title: 'OQLF · Ethnie, 2023', url: 'https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/17094349/ethnie' },
  { id: 'tribu', title: 'Académie française · Tribu, 9e édition', url: 'https://www.dictionnaire-academie.fr/article/A9T2178' },
  { id: 'clan', title: 'Académie française · Clan, 9e édition', url: 'https://www.dictionnaire-academie.fr/article/A9C2485' },
  { id: 'lignage', title: 'Académie française · Lignage, 9e édition', url: 'https://www.dictionnaire-academie.fr/article/A9L0800' },
  { id: 'langues', title: 'LGIDF/CNRS · Fang boulou, cadre linguistique', url: 'https://lgidf.cnrs.fr/fang-boulou' },
  { id: 'historique', title: 'H.-M. Bôt Ba Njock · Bulu et Fang, 1960', url: 'https://www.persee.fr/doc/jafr_0037-9166_1960_num_30_2_1922' },
  { id: 'parente', title: 'Simon David Yana · Famille et parenté Fang-Béti-Bulu, IRD', url: 'https://horizon.documentation.ird.fr/exl-doc/pleins_textes/pleins_textes_6/colloques2/39916.pdf' },
];
export const culturalConcepts = [
  { id: 'ethnie', title: 'Ethnie', axis: 'Identité et histoire culturelle', icon: 'circle', short: 'Un groupe qui se reconnaît des repères culturels et historiques communs.', detail: 'La langue, des pratiques culturelles, une histoire et un sentiment d’appartenance peuvent participer à cette identité. Cela ne signifie pas que tous les membres sont identiques, ni que l’ethnie est une catégorie biologique.', question: 'Comment les personnes nomment-elles leur appartenance ?', sourceIds: ['ethnie'] },
  { id: 'tribu', title: 'Tribu', axis: 'Organisation sociale, selon le contexte', icon: 'gather', short: 'Un nom donné à certains groupes organisés, selon la société et l’époque.', detail: 'Le terme peut renvoyer à une organisation de familles, à une communauté politique ou à une catégorie historique. Son usage doit être précisé localement : il n’existe pas partout un étage unique et obligatoire appelé « tribu ».', question: 'Qui utilise ce mot, à quelle époque et pour quel groupe ?', sourceIds: ['tribu', 'historique'] },
  { id: 'clan', title: 'Clan', axis: 'Appartenance de parenté', icon: 'roots', short: 'Un groupe de parenté auquel les personnes se rattachent selon une tradition de filiation.', detail: 'Les règles de rattachement peuvent suivre le côté paternel ou maternel selon la société. Un clan peut réunir des unités lignagères, comme dans les exemples étudiés par Yana. Ses usages se documentent localement ; un nom de famille seul ne suffit pas à établir cette appartenance.', question: 'Quelles règles et traditions relient les membres de ce clan ?', sourceIds: ['clan', 'parente'] },
  { id: 'lignage', title: 'Lignage', axis: 'Filiation sur plusieurs générations', icon: 'lineage', short: 'Un groupe défini par une filiation à un ancêtre commun selon une ligne donnée.', detail: 'En anthropologie, la filiation du lignage est unilinéaire : le rattachement suit une ligne paternelle ou maternelle. « Lignée » peut aussi désigner plus largement une succession généalogique. Ces mots ne sont pas automatiquement interchangeables dans tous les contextes.', question: 'Par quelle succession de générations le rattachement est-il décrit ?', sourceIds: ['lignage'] },
];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function culturalAnswer(query: string) {
  const q = normalize(query);
  const concepts = /\b(ethni\w*|tribu\w*|clans?|lignages?|lignees?|ayong|ayon|mvog|mvoq)\b/.test(q);
  const fang = /\b(fang|bulu|boulou|ewondo|beti|ekang|ntumu|ntoumou|eton)\b/.test(q);
  const personal = (concepts || fang) && /\b(mon|ma|mes|notre|nos)\b/.test(q) && /\b(devin\w*|determin\w*|dedui\w*|trouv\w*|quel\w*|appart\w*|suis|sommes)\b/.test(q) && /\b(nom|clan|tribu|ethnie|origine)\b/.test(q);
  const classification = fang && (/\b(groupe|ethni\w*|tribu\w*|clan\w*|differen\w*|class\w*|regroup\w*|peuple\w*|parente|ensemble)\b/.test(q) || /\b(langues?)\b/.test(q) && /\b(est|sont|meme|differen\w*)\b/.test(q));
  if (!concepts && !classification && !personal) return null;
  const focusIds = culturalConcepts.filter((concept) => q.includes(concept.id) || (concept.id === 'lignage' && /lignee|mvog|mvoq/.test(q)) || (concept.id === 'clan' && /ayong|ayon/.test(q))).map((concept) => concept.id);
  let answer = personal
    ? 'Je ne peux pas déterminer votre ethnie, votre tribu ou votre clan à partir d’un nom, d’un lieu ou des liens de l’arbre. Je peux expliquer les termes et vous aider à documenter une appartenance déclarée par la famille, avec ses usages et ses sources.'
    : fang
      ? 'Votre intuition sur plusieurs niveaux d’appartenance est utile, mais « Fang → tribus Ewondo/Bulu → clans » n’est pas une classification universelle. Le CNRS présente ici un cadre linguistique où le boulou, l’ewondo, l’eton, le fang et le mvëlë sont apparentés. Des études historiques emploient d’autres découpages et appellations. Il faut distinguer langue, identité culturelle et organisation de la parenté, puis préciser la région, l’époque et la source.'
      : 'Ethnie, tribu, clan et lignage ne désignent pas exactement la même chose. Ils éclairent des appartenances culturelles, des organisations sociales ou des relations de filiation. Leurs usages varient selon les sociétés et les sources : les ranger dans une pyramide unique ferait perdre ces différences.';
  if (!personal && !fang && focusIds.length === 1) {
    const concept = culturalConcepts.find((item) => item.id === focusIds[0])!;
    answer = `${concept.title} : ${concept.short} ${concept.detail}`;
  } else if (!personal && !fang && focusIds.length === 2 && focusIds.includes('clan') && focusIds.includes('lignage')) {
    answer = 'Le clan renvoie à une appartenance de parenté plus large ; le lignage décrit un groupe rattaché à un ancêtre commun suivant une ligne de filiation. Un clan peut réunir des unités lignagères, comme dans l’étude de Yana sur les Fang-Béti-Bulu. Cette articulation doit être vérifiée dans le contexte concerné, et non imposée à toutes les sociétés.';
  }
  return {
    answer, contextUsed: false, responseKind: 'cultural-explanation',
    suggestions: ['Quelle différence entre clan et lignage ?', 'Fang, Ewondo et Bulu : peuples ou langues ?', 'Explique ethnie et tribu simplement'],
    explanation: {
      version: 1, kind: 'cultural-concepts', title: fang ? 'Fang, Ewondo, Bulu : changer de point de vue' : 'Quatre mots, plusieurs façons de se relier',
      focusIds, concepts: culturalConcepts,
      notice: 'Schémas pédagogiques généraux. Aucune appartenance n’est attribuée aux personnes de votre arbre.',
      linguisticExample: fang ? {
        title: 'Un exemple de rapprochement linguistique', center: 'Sous-groupe yaoundé–fang', labels: ['Boulou', 'Ewondo', 'Eton', 'Fang', 'Mvëlë'],
        caption: 'Présentation linguistique du LGIDF/CNRS. Ces liens indiquent une parenté entre langues, pas une descendance entre personnes ni un classement unique des peuples.', sourceIds: ['langues'],
        historicalNote: 'Dans son étude de 1960, Bôt Ba Njock utilise un ensemble large et distingue notamment Bati, Bulu et Fang, puis des tribus, clans et lignages. Cette nomenclature historique illustre un usage situé ; elle ne doit pas être imposée comme une identité actuelle à chaque famille.',
      } : null,
      localWords: /\b(ayong|ayon|mvog|mvoq)\b/.test(q) ? 'Les termes locaux ne correspondent pas toujours à un seul mot français. Dans l’étude de Yana, « ayon » renvoie au clan et « mvog » à des unités lignagères ; indiquez le parler et le contexte avant de généraliser.' : null,
      story: [
        { scene: 'question', title: 'Une question à la veillée', text: 'Dans cette petite scène inventée, un enfant demande : « Le mot qui désigne notre langue est-il aussi celui de notre clan ? »', simple: 'Un enfant demande : « Notre langue et notre clan, est-ce la même chose ? »' },
        { scene: 'voices', title: 'On écoute plusieurs points de vue', text: 'Un proche explique comment la famille se nomme. Un livre décrit les langues apparentées. Un autre document parle de filiation. Ces réponses peuvent se compléter sans employer les mêmes catégories.', simple: 'La famille parle de son histoire. Le livre parle des langues. Ce sont deux informations différentes.' },
        { scene: 'archive', title: 'On conserve le contexte', text: 'La famille note le terme exact, le lieu, la période et la source, puis laisse ouverts les points incertains. Cette scène illustre une méthode ; elle ne raconte pas l’histoire réelle d’un peuple ou d’un membre de votre arbre.', simple: 'On écrit qui a raconté quoi, où et quand. On garde aussi les questions sans réponse.' },
      ],
      sources: culturalSources.filter((source) => !['langues', 'historique'].includes(source.id) || fang || concepts),
    },
  };
}
