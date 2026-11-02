// Introductory course authored for GRIOT. Sources are attached to every item.
// Phonetic transcriptions are preserved, not presented as a standard orthography.
export const fangCourse = {
  id: 'fang-ntumu-intro-v1', languageId: 'fang1246', iso: 'fan', name: 'Fang · premiers pas', variety: 'Introduction au fang-ntumu', version: 1,
  scope: 'Un parcours de découverte préparé à partir de sources externes : aucun proche n’a besoin de créer les leçons. Les transcriptions des sources sont conservées ; ce n’est pas un cours complet ni une certification. Les autres variétés du fang peuvent employer d’autres formes.',
  sources: {
    dzaleu: { name: 'Dzaleu · démonstration de Mbóló', url: 'https://dzaleu.net/mini-quiz-que-signifie-mbolo-en-langue-ekang/', detail: 'Démonstration publiée par Dzaleu, usage de la salutation dans l’espace Beti/Fang, notamment Ntumu. Vidéo liée, non copiée.' },
    uob: { name: 'Pamphile Mebiame-Akono · Université Omar Bongo', url: 'https://publicrell.crelluob.com/uploads/Article8-No4%20Special.pdf', detail: 'Les rituels communicatifs des Fang-Ntumu, p. 192. Formes transcrites dans l’étude du ntumu d’Oyem.' },
    cnrs: { name: 'Ondo Obame & Zribi-Hertz · LGIDF / CNRS', url: 'https://lacito.cnrs.fr/wp-content/uploads/2022/04/5.FANG_.NTOUMOU8oct21-copie_1.pdf', detail: 'Le fang-ntoumou, 2021. La fiche utilise une transcription phonétique, pas une orthographe officielle.' },
  },
  units: [
    { id: 'saluer', title: 'Oser le premier bonjour', icon: '01', goal: 'Reconnaître une salutation, puis une réponse.', intro: 'Commencez par une formule courte. Observez le sens, essayez de la retrouver sans regarder, puis revenez dessus demain.', items: [
      { id: 'mbolo', expression: 'Mbóló', meaning: 'Bonjour', source: 'dzaleu', note: 'Une salutation pour ouvrir un échange. La démonstration de Dzaleu permet d’entendre ce mot ; elle ne sert pas de modèle audio pour tous les autres mots du parcours.', video: 'SvzF3HDGiXg' },
      { id: 'mbolane', expression: 'mbòláné', meaning: 'Bonjour à vous', source: 'uob', note: 'L’étude décrit cette forme quand la salutation s’adresse à un groupe. Gardez cette situation en mémoire, au lieu de mémoriser seulement des lettres.' },
      { id: 'ambolo', expression: 'àmbòló', meaning: 'Bonjour à toi', source: 'uob', note: 'Dans l’échange rapporté par la source, cette forme répond à la salutation collective. Elle est présentée ici dans ce contexte précis.' },
    ] },
    { id: 'nouvelles', title: 'Entrer dans un échange', icon: '02', goal: 'Reconnaître des expressions de salutation et d’état.', intro: 'Une conversation se construit à deux. Lisez la situation française, cherchez la formule correspondante, puis inversez les rôles.', items: [
      { id: 'salutation', expression: 'mávə̀ wàmbóló', meaning: 'Je te salue', source: 'uob', note: 'Cette formule accomplit directement l’acte de saluer. Retenez l’expression entière, sans inventer une traduction mot à mot.' },
      { id: 'bien', expression: 'mə̀ nə́ vwá', meaning: 'Je vais bien', source: 'uob', note: 'La source donne cette réponse à une question sur l’état de la personne. Les petits signes au-dessus des voyelles font partie de la transcription.' },
      { id: 'pas-bien', expression: 'mésə̀ vwáá', meaning: 'Je ne suis pas bien', source: 'uob', note: 'Comparez cette formule à la réponse positive. Un changement de forme peut changer le sens ; ne déduisez pas une règle générale de négation à partir de ce seul exemple.' },
    ] },
    { id: 'mots', title: 'Des mots autour de nous', icon: '03', goal: 'Associer quatre mots à leur sens.', intro: 'Choisissez un petit objet ou une image mentale pour chaque mot. La répétition gagne à être reliée à une situation.', items: [
      { id: 'poisson', expression: 'kwas', meaning: 'Poisson', source: 'cnrs', note: 'Mot présent dans les exemples de la fiche linguistique. La transcription du ton varie avec le contexte des exemples : cette entrée n’est pas un modèle oral autonome.' },
      { id: 'arbre', expression: 'è-lé', meaning: 'Arbre', source: 'cnrs', note: 'La fiche sépare ici un préfixe et une base par un tiret. Le tiret décrit une structure linguistique ; il ne représente pas une pause à prononcer.' },
      { id: 'personne', expression: 'mòt', meaning: 'Personne', source: 'cnrs', note: 'Dans les exemples de la source, ce mot renvoie à un être humain. Conservez le signe de ton dans la transcription.' },
      { id: 'chose', expression: 'dzòm', meaning: 'Chose', source: 'cnrs', note: 'Ce mot apparaît dans plusieurs constructions de la source. Le contexte de la phrase reste nécessaire pour une traduction complète.' },
    ] },
    { id: 'reperes', title: 'Comprendre avant de traduire', icon: '04', goal: 'Repérer trois différences utiles avec le français.', intro: 'Toutes les langues ne construisent pas les phrases comme le français. Ces questions portent sur des repères de lecture, pas sur une maîtrise complète de la grammaire.', items: [
      { id: 'tons', kind: 'concept', prompt: 'Les signes de ton peuvent-ils être supprimés pour apprendre la forme donnée ?', expression: 'Conserver les tons', meaning: 'Non, ils font partie des repères à apprendre', choices: ['Non, ils font partie des repères à apprendre', 'Oui, ils sont seulement décoratifs', 'Oui, dès que le mot est court'], source: 'cnrs', note: 'En fang-ntumu, les tons ont un rôle linguistique. Le coach conserve les accents lors des exercices écrits et ne remplace pas une voix de locuteur par une voix française.' },
      { id: 'articles', kind: 'concept', prompt: 'Faut-il ajouter automatiquement un équivalent de « le » ou « un » devant chaque nom ?', expression: 'Nom et contexte', meaning: 'Non, le contexte participe à son interprétation', choices: ['Non, le contexte participe à son interprétation', 'Oui, il faut toujours traduire chaque article', 'Seulement après un nom de personne'], source: 'cnrs', note: 'La fiche décrit des noms sans article. On ne peut donc pas construire une phrase en remplaçant mécaniquement chaque mot français.' },
      { id: 'classes', kind: 'concept', prompt: 'Les noms et leurs accords se travaillent-ils uniquement avec le masculin et le féminin français ?', expression: 'Classes nominales', meaning: 'Non, il faut apprendre les classes et leurs accords', choices: ['Non, il faut apprendre les classes et leurs accords', 'Oui, le système est identique au français', 'Il suffit de supprimer les accords'], source: 'cnrs', note: 'Les classes nominales organisent des accords. Ces premiers repères n’autorisent pas encore à produire librement tous les pluriels.' },
    ] },
  ],
};
