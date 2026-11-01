import { getProfileCoverage, getUpcomingBirthdays } from '../utils/dashboardInsights';

const storyIdeas = [
  { mark: '01', title: 'Les voix de nos aînés', question: 'Quel souvenir d’enfance aimeriez-vous transmettre aux plus jeunes ?', category: 'Un récit de vie' },
  { mark: '02', title: 'Le goût des retrouvailles', question: 'Quelle recette rassemble votre famille, et qui vous l’a transmise ?', category: 'Une tradition' },
  { mark: '03', title: 'Le chemin de nos racines', question: 'Quel lieu a changé l’histoire de votre famille ?', category: 'Un lieu de mémoire' },
];

export function DashboardMetrics({ personnes, relations, souvenirs, membres, onNavigate }) {
  const metrics = [
    { value: personnes.length, label: 'Personnes dans l’arbre', caption: 'Des visages, des parcours, des liens', panel: 'personnes', mark: '♧' },
    { value: relations.length, label: 'Liens familiaux', caption: 'Les générations se rencontrent', panel: 'relations', mark: '⌘' },
    { value: souvenirs.length, label: 'Souvenirs préservés', caption: 'Une mémoire qui se transmet', panel: 'souvenirs', mark: '❝' },
    { value: membres.filter((m) => m.statut === 'actif').length, label: 'Membres actifs', caption: 'Votre histoire se construit ensemble', panel: 'membres', mark: '◎' },
  ];
  return <div className="griot-metric-grid" aria-label="Votre famille en chiffres">{metrics.map((item, index) => (
    <button key={item.panel} className="griot-metric-card" onClick={() => onNavigate(item.panel)} style={{ '--entry-delay': `${index * 70}ms` }}>
      <span className="griot-metric-mark" aria-hidden="true">{item.mark}</span><strong>{item.value}</strong><span>{item.label}</span><small>{item.caption}</small><span className="griot-metric-arrow" aria-hidden="true">↗</span>
    </button>
  ))}</div>;
}

export default function DashboardInsights({ personnes, souvenirs, onOpenProfile, onNavigate, onStartStory, canContribute }) {
  const birthdays = getUpcomingBirthdays(personnes);
  const coverage = getProfileCoverage(personnes);
  const origins = new Set(personnes.map((p) => p.villageOrigine?.trim().toLocaleLowerCase('fr')).filter(Boolean));
  const recent = [
    ...personnes.filter((p) => p.dateCreation).map((p) => ({ id: `p-${p.id}`, date: p.dateCreation, title: `${p.prenom} ${p.nom}`, subtitle: 'Une personne a rejoint l’arbre', person: p })),
    ...souvenirs.filter((s) => s.dateCreation).map((s) => ({ id: `s-${s.id}`, date: s.dateCreation, title: s.titre, subtitle: 'Un souvenir a été préservé' })),
  ].filter((item) => !Number.isNaN(new Date(item.date).getTime())).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return <div className="griot-dashboard-insights">
    <div className="griot-insight-columns">
      <section className="griot-insight-card">
        <div className="griot-dashboard-section-heading"><div><p className="griot-eyebrow">LES PETITES ATTENTIONS</p><h3>Prochains anniversaires</h3></div><span className="griot-insight-symbol" aria-hidden="true">✧</span></div>
        <p className="griot-insight-intro">Des occasions de prendre des nouvelles et de créer de nouveaux souvenirs.</p>
        {birthdays.length ? <div className="griot-birthday-list">{birthdays.map(({ person, date, age, today }) => <button key={person.id} onClick={() => onOpenProfile(person)}>
          <span className="griot-birthday-date"><strong>{date.getDate()}</strong><small>{date.toLocaleDateString('fr-FR', { month: 'short' })}</small></span>
          <span><strong>{person.prenom} {person.nom}</strong><small>{today ? 'Aujourd’hui · ' : ''}{age} ans{today ? ' · Joyeux anniversaire !' : ''}</small></span><span aria-hidden="true">→</span>
        </button>)}</div> : <div className="griot-insight-empty"><strong>Chaque date raconte un commencement.</strong><p>Renseignez les dates de naissance des proches vivants pour retrouver leurs anniversaires ici.</p><button className="griot-dashboard-text-link" onClick={() => onNavigate('personnes')}>Consulter les fiches →</button></div>}
      </section>
      <section className="griot-insight-card">
        <div className="griot-dashboard-section-heading"><div><p className="griot-eyebrow">DES PORTRAITS PLUS RICHES</p><h3>Les détails qui font l’histoire</h3></div></div>
        <p className="griot-insight-intro">La part des profils renseignés, pour savoir où poursuivre vos recherches.</p>
        <div className="griot-coverage-list">{coverage.map((item) => <div key={item.label}><div><strong>{item.label}</strong><span>{item.count} / {item.total}</span></div><div className="griot-coverage-track" role="progressbar" aria-label={item.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.percent}><span style={{ width: `${item.percent}%` }} /></div><small>{item.hint}</small></div>)}</div>
        <button className="griot-dashboard-text-link" onClick={() => onNavigate('personnes')}>Explorer les profils →</button>
      </section>
    </div>
    <section className="griot-story-studio">
      <div className="griot-dashboard-section-heading"><div><p className="griot-eyebrow">L’ATELIER DE TRANSMISSION</p><h3>Et si vous racontiez…</h3></div><span>Une question, un souvenir, une trace.</span></div>
      <div className="griot-story-prompts">{storyIdeas.map((idea) => <article key={idea.mark}><span className="griot-story-number" aria-hidden="true">{idea.mark}</span><small>{idea.category}</small><h4>{idea.title}</h4><p>{idea.question}</p><button className="griot-dashboard-text-link" onClick={() => canContribute ? onStartStory(idea) : onNavigate('souvenirs')}>{canContribute ? 'Commencer ce récit' : 'Explorer les souvenirs'} <span aria-hidden="true">↗</span></button></article>)}</div>
    </section>
    <div className="griot-insight-columns">
      <section className="griot-insight-card"><div className="griot-dashboard-section-heading"><div><p className="griot-eyebrow">LA MÉMOIRE SE CONSTRUIT</p><h3>Derniers ajouts</h3></div></div>
        {recent.length ? <ol className="griot-activity-list">{recent.map((item) => <li key={item.id}><span className="griot-activity-dot" aria-hidden="true" /><div><small>{item.subtitle}</small><button onClick={() => item.person ? onOpenProfile(item.person) : onNavigate('souvenirs')}>{item.title}</button><time dateTime={item.date}>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</time></div></li>)}</ol> : <p className="griot-insight-intro">Les prochaines personnes et histoires ajoutées apparaîtront ici, pour suivre la construction de votre mémoire.</p>}
      </section>
      <section className="griot-roots-card"><span className="griot-roots-orbit" aria-hidden="true">◎</span><p className="griot-eyebrow">D’ICI ET D’AILLEURS</p><h3>Nos histoires ont des racines.</h3><p>{origins.size ? `${origins.size} lieu${origins.size > 1 ? 'x' : ''} d’origine renseigné${origins.size > 1 ? 's' : ''} dans les profils de votre arbre.` : 'Un village, une ville, un départ : chaque lieu éclaire un morceau de votre histoire.'}</p><p>Réunissez les étapes des parcours familiaux et transmettez le souvenir des lieux à ceux qui viendront après vous.</p><button className="griot-button griot-button-outline" onClick={() => onNavigate('origines')}>Explorer la carte des origines →</button></section>
    </div>
  </div>;
}
