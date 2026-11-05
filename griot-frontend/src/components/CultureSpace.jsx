import { useEffect, useState } from 'react';
import api from '../api/client';
import FamilySalon from './FamilySalon';
import LanguageWorkshop from './LanguageWorkshop';
import MigrationHistory from './MigrationHistory';
import AutonomousTutor from './AutonomousTutor';
import LanguagePlan from './LanguagePlan';
import { learningCourses } from '../data/worldCourses';
import KnowledgeSources from './KnowledgeSources';

export default function CultureSpace({ treeId, treeName, migrations, personnes, user, role, onNavigate }) {
  const [declared, setDeclared] = useState([]);
  const [tab, setTab] = useState('salon'); const [course, setCourse] = useState(learningCourses[0]); const [message, setMessage] = useState(''); const [composer, setComposer] = useState(0); const [messageTheme, setMessageTheme] = useState('discussion');
  useEffect(() => {
    let active = true;
    if (tab === 'professeur') api.getLanguageCards(treeId).then((cards) => { if (active) setDeclared(cards.map((card) => ({ id: card.langue, name: card.nomLangue }))); }).catch(() => { if (active) setDeclared([]); });
    return () => { active = false; };
  }, [treeId, tab]);
  const discuss = (text) => { setMessage(text); setMessageTheme(tab === 'langues' ? 'langue' : 'migration'); setComposer((value) => value + 1); setTab('salon'); };
  return <div className="griot-culture-space"><header className="griot-culture-hero"><div><p className="griot-eyebrow">LE CERCLE DE TRANSMISSION</p><h2>Nos voix, nos langues, nos histoires.</h2><p>Un espace pour se retrouver, apprendre ensemble et transmettre ce qui fait la richesse de {treeName}.</p><span className="griot-culture-private">Cercle privé · Membres de cet arbre</span></div><div className="griot-culture-hero-art" aria-hidden="true"><span>Aa</span><span>ሀ</span><span>أ</span><small>Écouter · Jouer · Raconter</small></div></header><nav className="griot-culture-tabs" aria-label="Espace collaboratif">{[['salon', 'Le salon familial'], ['langues', 'Apprendre nos langues'], ['professeur', 'Mes parcours de langues'], ['histoire', 'L’histoire de nos parcours'], ['sources', 'Sources documentaires']].map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>{tab === 'salon' && <FamilySalon key={composer} treeId={treeId} user={user} role={role} initialMessage={message} initialTheme={messageTheme} onDraft={(text, theme) => { setMessage(text); setMessageTheme(theme); }} />}{tab === 'langues' && <LanguageWorkshop treeId={treeId} migrations={migrations} user={user} role={role} onDiscuss={discuss} onLearn={(selected) => { setCourse(selected); setTab('professeur'); }} />}{tab === 'professeur' && <><LanguagePlan migrations={migrations} declared={declared} onLearn={setCourse} /><AutonomousTutor key={`${treeId}:${course.id}`} treeId={treeId} user={user} course={course} /></>}{tab === 'sources' && <KnowledgeSources key={treeId} treeId={treeId} role={role} />}{tab === 'histoire' && <MigrationHistory personnes={personnes} migrations={migrations} onDiscuss={discuss} onNavigate={onNavigate} />}<aside className="griot-culture-offline-note">Au village : préparez le mode hors ligne pour conserver les fiches textuelles et les derniers échanges chargés. L’envoi de messages, la validation et l’écoute des voix nécessitent une connexion. Les progrès des jeux restent personnels à cet appareil.</aside></div>;
}
