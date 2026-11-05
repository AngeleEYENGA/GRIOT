import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import FamilyTreeView from '../components/FamilyTreeView';
import OriginsJourney from '../components/OriginsJourney';
import MigrationHistory from '../components/MigrationHistory';
import LanguagePlan from '../components/LanguagePlan';
import AutonomousTutor from '../components/AutonomousTutor';
import SiteFooter from '../components/SiteFooter';

export default function PublicTreePage({ treeId }) {
  const [tree, setTree] = useState(null); const [error, setError] = useState(''); const [tab, setTab] = useState('arbre'); const [profile, setProfile] = useState(null); const [course, setCourse] = useState(null);
  const courseRef = useRef(null);
  useEffect(() => {
    let active = true; setTree(null); setError(''); setTab('arbre'); setCourse(null); setProfile(null);
    api.getPublicPresentation(treeId).then((data) => { if (active) setTree(data); }).catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [treeId]);
  useEffect(() => { if (course) courseRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' }); }, [course]);
  return <div className="griot-public-demos"><header className="griot-demo-site-header"><a href="#/" className="griot-demo-brand"><img src="/griot-icon.svg" alt="" /><strong>GRIOT</strong></a><nav aria-label="Navigation publique"><a href="#/">← Retour à l’accueil</a></nav></header><main>{error ? <section role="alert" className="griot-culture-empty"><h1>Présentation indisponible</h1><p>{error}</p><a href="#/">Retrouver les familles de l’accueil</a></section> : !tree ? <p role="status">Ouverture de l’arbre public…</p> : <><header className="griot-demo-intro"><p className="griot-eyebrow">UNE FAMILLE, DES LIENS, UNE HISTOIRE</p><h1>{tree.nom}</h1><p>{tree.introductionPublique}</p><span className="griot-culture-tag">{tree.personnes.length} personnes · Présentation publique · Lecture seule</span></header><aside className="griot-demo-checklist"><h2>Découvrez comment raconter une histoire familiale</h2><p>Commencez par les liens entre générations, suivez les lieux sur la carte puis explorez les langues. Les personnages de ces arbres d’introduction sont fictifs ; les repères historiques restent des éléments de contexte à vérifier.</p></aside><nav className="griot-demo-tabs" aria-label="Explorer cet arbre public">{[['arbre', 'Arbre généalogique'], ['carte', 'Origines et récits'], ['langues', 'Langues et premiers pas']].map(([id, label]) => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>{tab === 'arbre' && <FamilyTreeView treeName={tree.nom} personnes={tree.personnes} relations={tree.relations} onOpenProfile={setProfile} />}{tab === 'carte' && <><OriginsJourney key={tree.id} arbreId={tree.id} treeName={tree.nom} migrations={tree.migrations} personnes={tree.personnes} role="lecteur" /><MigrationHistory personnes={tree.personnes} migrations={tree.migrations} /></>}{tab === 'langues' && <><LanguagePlan migrations={tree.migrations} declared={tree.languesPubliques.map((iso) => ({ iso }))} onLearn={setCourse} /><section ref={courseRef}>{course && <AutonomousTutor key={`${tree.id}:${course.id}`} treeId={tree.id} user={{ id: 'public-tree-visitor' }} course={course} publicDemo />}</section></>}{profile && <aside className="griot-demo-profile" role="dialog" aria-modal="false" aria-label={`Profil : ${profile.prenom}`}><button type="button" className="griot-button griot-button-outline" onClick={() => setProfile(null)}>Fermer</button><h2>{profile.prenom} {profile.nom}</h2><p>{profile.villageOrigine}</p><p>{profile.biographie}</p></aside>}</>}</main><SiteFooter /></div>;
}
