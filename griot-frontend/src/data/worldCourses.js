import { fangCourse } from './fangCourse.js';

const makeCourse = ({ iso, label, locale, source, phrases, grammar, keyboard = [] }) => ({
  id: `${iso}-intro-v1`, iso, label, name: `${label} · premiers pas`, variety: `${label} · initiation`, version: 1, ttsLocale: locale, keyboard,
  scope: 'Un parcours de découverte pour débutants, accessible aux enfants accompagnés comme aux adultes. Il prépare les premiers échanges et ne constitue pas une formation complète.',
  sources: { reference: source },
  units: [
    ...[0, 1].map((index) => ({ id: `phrases-${index}`, icon: `0${index + 1}`, title: index ? 'Échanger avec politesse' : 'Faire le premier pas', goal: 'Retrouver trois expressions sans aide', intro: 'Observez le sens et le contexte, écoutez si une voix est disponible, puis entraînez-vous.', items: phrases.slice(index * 3, index * 3 + 3).map(([expression, meaning, note, pronunciation], i) => ({ id: `${iso}-${index * 3 + i}`, expression, meaning, note, pronunciation, source: 'reference' })) })),
    { id: 'reperes', icon: '03', title: 'Comprendre avant de parler', goal: 'Reconnaître les formes du cours', intro: 'Ces questions vérifient votre compréhension des expressions étudiées.', items: grammar.map(([expression, prompt, meaning, choices, note], i) => ({ id: `${iso}-concept-${i}`, kind: 'concept', expression, prompt, meaning, choices, note, source: 'reference' })) },
  ],
});

export const worldCourses = [
  makeCourse({ iso: 'eng', label: 'Anglais', locale: 'en-GB', source: { name: 'British Council · Meeting people at a dinner', url: 'https://learnenglish.britishcouncil.org/free-resources/listening/a1/meeting-people-dinner', detail: 'Dialogue de rencontre pour débutants ; les consignes françaises et les exercices GRIOT sont originaux.' }, phrases: [
    ['Hello', 'Bonjour', 'Une salutation courante, sans indication de moment de la journée.'],
    ['Hi', 'Salut', 'Une salutation plus familière.'],
    ['Nice to meet you', 'Enchanté de faire votre connaissance', 'À utiliser lors d’une première rencontre.'],
    ['My name is', 'Je m’appelle', 'Ajoutez votre prénom après cette formule. Ici, retrouvez seulement la formule.'],
    ['My name isn’t', 'Je ne m’appelle pas', 'La contraction isn’t correspond à is not. Une apostrophe droite ou courbe est acceptée.'],
    ['Nice to meet you too', 'Enchanté également', 'Too permet de retourner cette formule de bienvenue.'],
  ], grammar: [
    ['my', 'Dans « My name is », à quoi correspond « my » ?', 'Mon', ['Mon', 'Ton', 'Leur'], 'My indique ici à qui appartient le nom.'],
    ['isn’t', 'Quelle forme exprime une négation ?', 'isn’t', ['is', 'isn’t', 'too'], 'Isn’t est une contraction négative.'],
    ['too', 'Quel mot ajoute le sens « également » ?', 'too', ['my', 'too', 'name'], 'Comparez les deux formules Nice to meet you du cours.'],
  ], keyboard: ['’'] }),
  makeCourse({ iso: 'deu', label: 'Allemand', locale: 'de-DE', source: { name: 'Ministry for Ethnic Communities · German greetings', url: 'https://www.ethniccommunities.govt.nz/resources/information-and-resources-in-other-languages/greetings-in-different-languages/greetings-in-german', detail: 'Répertoire public de salutations et d’enregistrements allemands. Consultez les voix originales sur le site source.' }, phrases: [
    ['Hallo', 'Salut', 'Une salutation informelle.'], ['Guten Tag', 'Bonjour', 'Une salutation plus formelle.'], ['Danke', 'Merci', 'Pour remercier votre interlocuteur.'],
    ['Guten Morgen', 'Bonjour le matin', 'Une salutation du matin.'], ['Guten Abend', 'Bonsoir', 'Une salutation du soir.'], ['Auf Wiedersehen', 'Au revoir', 'Pour prendre congé.'],
  ], grammar: [
    ['Hallo / Guten Tag', 'Quelle salutation est la plus formelle dans le cours ?', 'Guten Tag', ['Hallo', 'Guten Tag', 'Danke'], 'Le registre dépend de la relation avec votre interlocuteur.'],
    ['Morgen', 'Quel élément désigne le matin ?', 'Morgen', ['Abend', 'Morgen', 'Danke'], 'Comparez Guten Morgen et Guten Abend.'],
    ['Les noms allemands', 'Quelle observation correspond aux exemples du cours ?', 'Les noms commencent par une majuscule', ['Tous les mots ont une majuscule', 'Les noms commencent par une majuscule', 'Aucun nom ne prend de majuscule'], 'Tag, Morgen et Abend sont des noms.'],
  ], keyboard: ['ä', 'ö', 'ü', 'ß'] }),
  makeCourse({ iso: 'spa', label: 'Espagnol', locale: 'es-ES', source: { name: 'Ministry for Ethnic Communities · Spanish greetings', url: 'https://www.ethniccommunities.govt.nz/resources/information-and-resources-in-other-languages/greetings-in-different-languages/greetings-in-spanish', detail: 'Répertoire public de salutations espagnoles. Les usages du soir varient selon le moment et le contexte.' }, phrases: [
    ['Buenas', 'Salut', 'Formule informelle abrégée.'], ['Hola a todos', 'Bonjour à tous', 'Pour saluer un groupe.'], ['Gracias', 'Merci', 'Pour remercier.'],
    ['Buenos días', 'Bonjour le matin', 'Gardez l’accent écrit sur la lettre í.'], ['Buenas tardes', 'Bonjour l’après-midi', 'S’utilise de l’après-midi jusqu’au début de soirée selon le contexte.'], ['Buenas noches', 'Bonsoir ou bonne nuit', 'Après la tombée du jour ; peut aussi servir à prendre congé.'],
  ], grammar: [
    ['días / tardes', 'Quelle association est présentée dans le cours ?', 'Buenos días / Buenas tardes', ['Buenas días / Buenos tardes', 'Buenos días / Buenas tardes', 'Bueno días / Buena tardes'], 'La forme de l’adjectif s’accorde ici avec le nom.'],
    ['í', 'Quelle forme respecte l’accent écrit du cours ?', 'días', ['dias', 'días', 'dîas'], 'Les accents écrits font partie du mot.'],
    ['a todos', 'Quelle expression s’adresse à un groupe ?', 'Hola a todos', ['Gracias', 'Hola a todos', 'Buenas noches'], 'Tous est rendu ici par todos.'],
  ], keyboard: ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'] }),
  makeCourse({ iso: 'cmn', label: 'Chinois mandarin', locale: 'zh-CN', source: { name: 'Instituto Cervantes Shanghai · Guide 2025', url: 'https://shanghai.cervantes.es/imagenes/File/Guia_de_Shanghai_2025.pdf', detail: 'Vocabulaire de découverte en mandarin ; pinyin fourni comme aide. Ce cours ne couvre pas toutes les langues de Chine.' }, phrases: [
    ['你好', 'Bonjour', 'Le pinyin indique les syllabes et les tons écrits, pas une lecture à la française.', 'Nǐ hǎo'], ['再见', 'Au revoir', 'Une formule pour prendre congé.', 'Zàijiàn'], ['谢谢', 'Merci', 'Le second élément est généralement prononcé avec un ton neutre.', 'Xièxie'],
    ['很好，你呢？', 'Très bien, et toi ?', 'Dans cet exercice écrit, conservez les caractères et la ponctuation du modèle.', 'Hěn hǎo, nǐ ne?'], ['你', 'Tu ou toi', 'Retrouvez ce caractère dans les expressions de la première étape.', 'Nǐ'], ['好', 'Bien ou bon', 'Le sens précis dépend de l’expression où apparaît ce caractère.', 'Hǎo'],
  ], grammar: [
    ['Pinyin', 'À quoi sert le pinyin présenté sous les caractères ?', 'À indiquer la prononciation', ['À indiquer la prononciation', 'À traduire en français', 'À remplacer toutes les langues de Chine'], 'Les marques sur les voyelles renseignent les tons lexicaux.'],
    ['呢', 'Dans « 你呢？ », quelle idée exprime la formule ?', 'Et toi ?', ['Et toi ?', 'Merci', 'Au revoir'], 'Cette petite question renvoie ici la parole à l’autre personne.'],
    ['你好', 'Quelle écriture est attendue en mode pratique pour « Bonjour » ?', '你好', ['你好', 'Merci', 'ninhao'], 'Ce premier parcours entraîne la reconnaissance des caractères. Le pinyin est une aide affichée dans les leçons.'],
  ], keyboard: ['你', '好', '再', '见', '谢', '很', '呢', '，', '？'] }),
];
export const learningCourses = [{ ...fangCourse, label: 'Fang' }, ...worldCourses];
