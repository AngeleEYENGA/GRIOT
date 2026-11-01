import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import PlaceFields from './PlaceFields';
import { useTheme } from '../contexts/useTheme';
const OriginsMap = lazy(() => import('./OriginsMap'));

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

export function OriginsPanel({ arbreId, migrations: allMigrations, personnes, role, onRefresh }) {
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [replayIndex, setReplayIndex] = useState(-1);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [draft, setDraft] = useState({ personneId: '', lieu: '', pays: '', dateEvenement: '', latitude: '', longitude: '' });
  const canEdit = ['admin', 'editeur', 'contributeur'].includes(role);
  const [personFilter, setPersonFilter] = useState('');
  const migrations = useMemo(() => allMigrations
    .filter((item) => !personFilter || (item.personneId || item.personne?.id) === personFilter)
    .slice().sort((a, b) => (a.dateEvenement ? new Date(a.dateEvenement).getTime() : Infinity) - (b.dateEvenement ? new Date(b.dateEvenement).getTime() : Infinity) || (a.ordre || 0) - (b.ordre || 0)), [allMigrations, personFilter]);

  useEffect(() => {
    if (!replayPlaying) return undefined;
    if (replayIndex >= migrations.length - 1) {
      setReplayPlaying(false);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setReplayIndex((current) => current + 1);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [migrations.length, replayIndex, replayPlaying]);

  const saveMigration = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createMigration(arbreId, {
        personneId: draft.personneId,
        lieu: draft.lieu,
        pays: draft.pays || undefined,
        dateEvenement: draft.dateEvenement || undefined,
        latitude: draft.latitude === '' ? undefined : Number(draft.latitude),
        longitude: draft.longitude === '' ? undefined : Number(draft.longitude),
        ordre: allMigrations.length,
      });
      setDraft({ personneId: '', lieu: '', pays: '', dateEvenement: '', latitude: '', longitude: '' });
      setFormOpen(false);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeMigration = async (id) => {
    if (!window.confirm('Retirer cette étape du parcours familial ?')) return;
    setError('');
    try {
      await api.deleteMigration(arbreId, id);
      setReplayPlaying(false);
      setReplayIndex(-1);
      await onRefresh();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const toggleReplay = () => {
    if (replayPlaying) {
      setReplayPlaying(false);
      return;
    }
    if (replayIndex < 0 || replayIndex >= migrations.length - 1) setReplayIndex(0);
    setReplayPlaying(true);
  };

  return (
    <div className="griot-feature-screen">
      <PageIntro
        eyebrow="ORIGINES FAMILIALES"
        title="Carte des origines"
        description="Retracez les lieux et les étapes transmis par les membres de la famille."
      >
        {canEdit && <button className="griot-button griot-button-primary" onClick={() => setFormOpen(!formOpen)}>+ Ajouter un lieu</button>}
      </PageIntro>

      {error && <p className="griot-inline-error" role="alert">{error}</p>}

      {canEdit && personnes.some((person) => person.villageOrigine && !allMigrations.some((item) => (item.personneId || item.personne?.id) === person.id)) && <section className="griot-settings-card"><h3>Donner une place aux origines déjà renseignées</h3><p>Ces profils indiquent un lieu d’origine sans étape sur la carte. Confirmez le pays et les coordonnées pour le situer correctement.</p><div className="griot-setting-options">{personnes.filter((person) => person.villageOrigine && !allMigrations.some((item) => (item.personneId || item.personne?.id) === person.id)).map((person) => <button className="griot-button griot-button-outline" key={person.id} onClick={() => { setDraft({ personneId: person.id, lieu: person.villageOrigine, pays: '', dateEvenement: '', latitude: '', longitude: '' }); setFormOpen(true); }}>{person.prenom} · {person.villageOrigine}</button>)}</div></section>}

      <label className="griot-map-filter">Parcours à afficher<select value={personFilter} onChange={(event) => { setPersonFilter(event.target.value); setReplayPlaying(false); setReplayIndex(-1); }}><option value="">Toute la famille</option>{personnes.map((person) => <option key={person.id} value={person.id}>{person.prenom} {person.nom}</option>)}</select></label>
      <Suspense fallback={<p role="status">Chargement de la carte…</p>}><OriginsMap migrations={migrations} replayIndex={replayIndex} /></Suspense>
      {migrations.length > 0 && (
        <div className="griot-route-replay">
          <button type="button" className="griot-button griot-button-outline" onClick={toggleReplay}>
            {replayPlaying ? 'Mettre en pause' : replayIndex > -1 && replayIndex < migrations.length - 1 ? 'Reprendre le parcours' : 'Rejouer le parcours'}
          </button>
          <p aria-live="polite">
            {replayIndex < 0
              ? 'Visualisez les étapes dans leur ordre de transmission.'
              : `${replayPlaying ? 'Étape' : 'En pause à l’étape'} ${replayIndex + 1} sur ${migrations.length} · ${migrations[replayIndex]?.lieu.nom}`}
          </p>
        </div>
      )}

      {formOpen && (
        <form className="griot-form-card griot-grid-form" onSubmit={saveMigration}>
          <label>Personne concernée
            <select required value={draft.personneId} onChange={(event) => setDraft({ ...draft, personneId: event.target.value })}>
              <option value="">Choisir une personne</option>
              {personnes.map((personne) => <option key={personne.id} value={personne.id}>{personne.prenom} {personne.nom}</option>)}
            </select>
          </label>
          <PlaceFields value={draft} onChange={setDraft} />
          <label>Date ou période
            <input type="date" value={draft.dateEvenement} onChange={(event) => setDraft({ ...draft, dateEvenement: event.target.value })} />
          </label>
          <label>Latitude (facultative)
            <input type="number" step="any" min="-90" max="90" value={draft.latitude} onChange={(event) => setDraft({ ...draft, latitude: event.target.value })} />
          </label>
          <label>Longitude (facultative)
            <input type="number" step="any" min="-180" max="180" value={draft.longitude} onChange={(event) => setDraft({ ...draft, longitude: event.target.value })} />
          </label>
          <div className="griot-form-actions">
            <button type="button" className="griot-button griot-button-quiet" onClick={() => setFormOpen(false)}>Annuler</button>
            <button className="griot-button griot-button-primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le lieu'}</button>
          </div>
        </form>
      )}

      {migrations.length === 0 ? (
        <div className="griot-empty-state"><span>⌖</span><h3>Le parcours familial commence ici</h3><p>Ajoutez les lieux associés aux personnes pour documenter les origines et les migrations.</p></div>
      ) : (
        <>
          <div className="griot-route-list">
            {migrations.map((item, index) => (
              <article key={item.id} className="griot-route-item">
                <span className="griot-route-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="griot-route-copy">
                  <h3>{item.lieu.nom}{item.lieu.pays ? `, ${item.lieu.pays}` : ''}</h3>
                  <p>{item.personne.prenom} {item.personne.nom}{item.dateEvenement ? ` · ${new Date(item.dateEvenement).toLocaleDateString('fr-FR')}` : ''}</p>
                </div>
                {canEdit && <button className="griot-text-button" onClick={() => removeMigration(item.id)}>Retirer</button>}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const prompts = ['Qui est la personne la plus ancienne ?', 'Quelles relations manquent dans mon arbre ?', 'Comment compléter les origines familiales ?'];

  const ask = async (value) => {
    if (value.trim().length < 2) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const response = await api.askAI(value.trim(), arbreId);
      setAnswer(response.answer);
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
      <PageIntro eyebrow="ASSISTANT FAMILIAL" title="Demander à GRIOT" description="Posez une question sur les informations déjà enregistrées dans cet arbre." />
      <section className="griot-assistant-card">
        <div className="griot-assistant-mark">G</div>
        <div className="griot-assistant-content">
          <h3>Votre mémoire familiale, à portée de question.</h3>
          <p>Les réponses utilisent le contexte de cet arbre; elles ne remplacent pas une source ou une preuve.</p>
          <div className="griot-prompt-list">{prompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} disabled={loading}>{prompt}</button>)}</div>
          <form className="griot-assistant-form" onSubmit={(event) => { event.preventDefault(); ask(question); }}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} minLength={2} maxLength={1000} placeholder="Écrivez votre question…" aria-label="Question à GRIOT" />
            <button className="griot-button griot-button-primary" disabled={loading}>{loading ? 'Réflexion…' : 'Envoyer'}</button>
          </form>
          {error && <p className="griot-inline-error" role="alert">{error}</p>}
          {answer && <div className="griot-assistant-answer"><p>{answer}</p>{suggestions.length > 0 && <div>{suggestions.map((item) => <button key={item} onClick={() => ask(item)}>{item}</button>)}</div>}</div>}
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
