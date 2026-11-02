import { useState } from 'react';
import api from '../api/client';
import IllustratedAnswer from './IllustratedAnswer';
import { useTheme } from '../contexts/useTheme';

function PageIntro({ eyebrow, title, description, children }) {
  return (
    <section className="griot-panel-intro">
      <p className="griot-eyebrow">{eyebrow}</p>
      <div className="griot-panel-intro-row">
        <div><h2>{title}</h2><p>{description}</p></div>
        {children}
      </div>
    </section>
  );
}

export { default as OriginsPanel } from './OriginsJourney';

export function GovernancePanel({ arbreId, institution, preuves, personnes, role, onRefresh }) {
  const [institutionDraft, setInstitutionDraft] = useState({ nom: '', type: 'chefferie' });
  const [institutionInviteEmail, setInstitutionInviteEmail] = useState('');
  const [institutionInviteRole, setInstitutionInviteRole] = useState('validateur');
  const [proofDraft, setProofDraft] = useState({ type: 'témoignage familial', personneId: '', urlDocument: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const canManage = ['admin', 'editeur'].includes(role);
  const canCreate = ['admin', 'editeur', 'contributeur'].includes(role);

  const createInstitution = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createInstitution(arbreId, institutionDraft);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const addProof = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createProof(arbreId, {
        ...proofDraft,
        urlDocument: proofDraft.urlDocument || undefined,
        personneId: proofDraft.personneId || undefined,
      });
      setProofDraft({ type: 'témoignage familial', personneId: '', urlDocument: '' });
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const inviteInstitutionMember = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.inviteInstitutionMember(arbreId, institutionInviteEmail, institutionInviteRole);
      setInstitutionInviteEmail('');
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const reviewProof = async (proofId, status) => {
    setError('');
    try {
      await api.updateProof(arbreId, proofId, status);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="griot-feature-screen">
      <PageIntro
        eyebrow="TRANSMISSION & CONFIANCE"
        title="Espace chefferie"
        description="Suivez les preuves partagées et les demandes de vérification liées à cet arbre."
      />
      {error && <p className="griot-inline-error" role="alert">{error}</p>}

      <section className="griot-institution-card">
        <div>
          <p className="griot-eyebrow">ORGANISME ASSOCIÉ</p>
          <h3>{institution?.nom || 'Aucune institution déclarée'}</h3>
          <p>{institution ? `${institution.type} · ${institution.statutVerification === 'verifie_chefferie' ? 'Vérifiée par la chefferie' : 'Vérification institutionnelle en attente'}` : 'Les données ne sont pas présentées comme vérifiées par une institution.'}</p>
        </div>
        {!institution && role === 'admin' && (
          <form className="griot-inline-form" onSubmit={createInstitution}>
            <input aria-label="Nom de l’institution" required maxLength={160} value={institutionDraft.nom} onChange={(event) => setInstitutionDraft({ ...institutionDraft, nom: event.target.value })} placeholder="Nom de la chefferie ou de l’archive" />
            <select aria-label="Type d’institution" value={institutionDraft.type} onChange={(event) => setInstitutionDraft({ ...institutionDraft, type: event.target.value })}>
              <option value="chefferie">Chefferie</option><option value="archive">Archive</option><option value="association">Association</option>
            </select>
            <button className="griot-button griot-button-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Déclarer'}</button>
          </form>
        )}
      </section>

      {institution && role === 'admin' && (
        <section className="griot-institution-invite">
          <div><h3>Donner accès à l’institution</h3><p>Invitez un compte GRIOT existant à consulter ou valider les preuves de cet arbre.</p></div>
          <form onSubmit={inviteInstitutionMember}>
            <label className="sr-only" htmlFor="institution-member-email">Adresse email</label>
            <input id="institution-member-email" type="email" required maxLength={254} value={institutionInviteEmail} onChange={(event) => setInstitutionInviteEmail(event.target.value)} placeholder="nom@exemple.fr" />
            <label className="sr-only" htmlFor="institution-member-role">Rôle institutionnel</label>
            <select id="institution-member-role" value={institutionInviteRole} onChange={(event) => setInstitutionInviteRole(event.target.value)}>
              <option value="validateur">Validateur</option>
              <option value="lecteur">Lecteur</option>
            </select>
            <button className="griot-button griot-button-primary" disabled={saving}>{saving ? 'Invitation…' : 'Inviter'}</button>
          </form>
        </section>
      )}

      <section className="griot-governance-grid">
        <div className="griot-form-card">
          <div className="griot-section-heading"><div><h3>Soumettre une preuve</h3><p>Reliez une source à une personne pour documenter sa biographie.</p></div></div>
          {canCreate ? (
            <form className="griot-stack-form" onSubmit={addProof}>
              <label>Personne
                <select required value={proofDraft.personneId} onChange={(event) => setProofDraft({ ...proofDraft, personneId: event.target.value })}>
                  <option value="">Choisir une personne</option>
                  {personnes.map((personne) => <option key={personne.id} value={personne.id}>{personne.prenom} {personne.nom}</option>)}
                </select>
              </label>
              <label>Type de source
                <input required maxLength={80} value={proofDraft.type} onChange={(event) => setProofDraft({ ...proofDraft, type: event.target.value })} />
              </label>
              <label>Lien de référence (facultatif)
                <input type="url" maxLength={2000} value={proofDraft.urlDocument} onChange={(event) => setProofDraft({ ...proofDraft, urlDocument: event.target.value })} placeholder="https://…" />
              </label>
              <button className="griot-button griot-button-primary" disabled={saving}>{saving ? 'Envoi…' : 'Envoyer pour validation'}</button>
            </form>
          ) : <p className="griot-muted">Votre rôle ne permet pas de soumettre une preuve.</p>}
        </div>

        <div className="griot-form-card">
          <div className="griot-section-heading"><div><h3>File de validation</h3><p>{preuves.filter((preuve) => preuve.statutValidation === 'en_attente').length} en attente · {preuves.length} preuve{preuves.length === 1 ? '' : 's'} au total</p></div></div>
          {preuves.length === 0 ? <p className="griot-muted">Aucune preuve n’a encore été soumise.</p> : (
            <div className="griot-proof-list">
              {preuves.map((preuve) => (
                <article key={preuve.id} className="griot-proof-item">
                  <div><h4>{preuve.type}</h4><p>{preuve.personne ? `${preuve.personne.prenom} ${preuve.personne.nom}` : preuve.souvenir?.titre} · {preuve.auteur.prenom} {preuve.auteur.nom}</p></div>
                  <span className={`griot-status griot-status-${preuve.statutValidation}`}>{preuve.statutValidation === 'en_attente' ? 'En attente' : preuve.statutValidation === 'validee' ? 'Validée' : 'Rejetée'}</span>
                  {preuve.urlDocument && <a href={preuve.urlDocument} target="_blank" rel="noreferrer">Ouvrir la source</a>}
                  {canManage && preuve.statutValidation === 'en_attente' && <div className="griot-proof-actions"><button onClick={() => reviewProof(preuve.id, 'validee')}>Valider par la famille</button><button onClick={() => reviewProof(preuve.id, 'rejetee')}>Rejeter</button></div>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <p className="griot-governance-note">Une validation familiale n’équivaut pas à une certification officielle. Le statut institutionnel reste distinct et visible.</p>
    </div>
  );
}

export function AssistantPanel({ arbreId }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const prompts = ['Quelle différence entre ethnie, tribu, clan et lignage ?', 'Fang, Ewondo et Bulu : peuples ou langues ?', 'Quelles relations manquent dans mon arbre ?', 'Comment compléter les origines familiales ?'];

  const ask = async (value) => {
    if (value.trim().length < 2) return;
    setLoading(true);
    setError('');
    setAnswer('');
    setExplanation(null);
    try {
      const response = await api.askAI(value.trim(), arbreId);
      setAnswer(response.answer);
      setExplanation(response.explanation?.version === 1 ? response.explanation : null);
      setSuggestions(response.suggestions || []);
      setQuestion('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="griot-feature-screen">
      <PageIntro eyebrow="ASSISTANT FAMILIAL" title="Demander à GRIOT" description="Explorez votre mémoire familiale et les notions culturelles avec des explications illustrées et leurs sources." />
      <section className="griot-assistant-card">
        <div className="griot-assistant-mark">G</div>
        <div className="griot-assistant-content">
          <h3>Votre mémoire familiale, à portée de question.</h3>
          <p>Les conseils familiaux peuvent utiliser le contexte de l’arbre. Les notions culturelles sont expliquées avec un corpus sourcé et ne déterminent pas l’appartenance d’une personne.</p>
          <div className="griot-prompt-list">{prompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} disabled={loading}>{prompt}</button>)}</div>
          <form className="griot-assistant-form" onSubmit={(event) => { event.preventDefault(); ask(question); }}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} minLength={2} maxLength={1000} placeholder="Écrivez votre question…" aria-label="Question à GRIOT" />
            <button className="griot-button griot-button-primary" disabled={loading}>{loading ? 'Réflexion…' : 'Envoyer'}</button>
          </form>
          {error && <p className="griot-inline-error" role="alert">{error}</p>}
          {answer && <div className="griot-assistant-answer"><p>{answer}</p>{explanation && <IllustratedAnswer explanation={explanation} />}{suggestions.length > 0 && <div>{suggestions.map((item) => <button key={item} disabled={loading} onClick={() => ask(item)}>{item}</button>)}</div>}</div>}
        </div>
      </section>
    </div>
  );
}

export function StylePanel() {
  const { theme, setTheme } = useTheme();
  const colors = [
    { title: 'Accent principal', variable: '--griot-terracotta', note: 'Actions & repères' },
    { title: 'Accent de transmission', variable: '--griot-gold', note: 'Transmission' },
    { title: 'Accent de confiance', variable: '--griot-olive', note: 'Vie & collaboration' },
    { title: 'Texte', variable: '--griot-ink', note: 'Lisibilité' },
    { title: 'Fond', variable: '--griot-cream', note: 'Accueil' },
  ];
  return (
    <div className="griot-feature-screen">
      <PageIntro eyebrow="IDENTITÉ VISUELLE" title="Charte graphique GRIOT" description="Une interface chaleureuse, lisible et conçue pour mettre les récits familiaux au premier plan." />
      <section className="griot-settings-card"><h3>Personnaliser mon interface</h3><p>Les changements s’appliquent immédiatement à toute l’application et sont conservés sur cet appareil.</p><div className="griot-setting-options" role="group" aria-label="Mode d’affichage">{[['light', 'Clair'], ['dark', 'Sombre'], ['system', 'Selon l’appareil']].map(([mode, label]) => <button className="griot-button griot-button-outline" key={mode} aria-pressed={theme.mode === mode} onClick={() => setTheme({ ...theme, mode })}>{label}</button>)}</div><div className="griot-setting-options" role="group" aria-label="Palette de couleurs">{[['heritage', 'Terre & héritage'], ['forest', 'Forêt & racines'], ['ocean', 'Océan & diaspora']].map(([palette, label]) => <button className="griot-button griot-button-outline" key={palette} aria-pressed={theme.palette === palette} onClick={() => setTheme({ ...theme, palette })}>{label}</button>)}</div><button className="griot-dashboard-text-link" onClick={() => setTheme({ mode: 'system', palette: 'heritage' })}>Rétablir les préférences par défaut</button></section>
      <div className="griot-swatches">{colors.map((color) => <article key={color.variable}><span style={{ backgroundColor: `var(${color.variable})` }} /><h3>{color.title}</h3><p>{color.note} · Couleur active</p></article>)}</div>
      <section className="griot-type-sample"><div><small>TITRES · SERIF</small><h2>Racines & mémoire</h2></div><div><small>INTERFACE · SANS SERIF</small><p>Moderne, lisible et chaleureux. Les personnes et leurs récits restent au centre de chaque écran.</p></div></section>
    </div>
  );
}
