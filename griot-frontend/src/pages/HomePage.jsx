import { useEffect, useState } from 'react';
import api from '../api/client';
import InstallAppButton from '../components/InstallAppButton';
import SiteFooter from '../components/SiteFooter';

export default function HomePage({ onLogin, onRegister }) {
  const [query, setQuery] = useState('');
  const [families, setFamilies] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [presentations, setPresentations] = useState([]); const [presentationsError, setPresentationsError] = useState(''); const [presentationsLoading, setPresentationsLoading] = useState(true); const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true; setPresentationsLoading(true); setPresentationsError('');
    api.getPublicPresentations().then((rows) => { if (active) setPresentations(rows); }).catch((e) => { if (active) setPresentationsError(e.message); }).finally(() => { if (active) setPresentationsLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const searchFamilies = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const results = await api.searchPublicTrees(query);
      setFamilies(Array.isArray(results) ? results : []);
      setSearched(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="griot-home">
      <header className="griot-home-header">
        <a className="griot-home-brand" href="#accueil" aria-label="GRIOT, accueil">
          <img src="/griot-icon.svg" alt="" />
          <span>GRIOT</span>
        </a>
        <div className="griot-home-actions">
          <a className="griot-home-info-link" href="#/a-propos">À propos</a>
          <a className="griot-home-info-link" href="#/contact">Contact</a>
          <InstallAppButton compact />
          <button className="griot-button griot-button-quiet" onClick={onLogin}>Se connecter</button>
          <button className="griot-button griot-button-primary" onClick={onRegister}>Créer un compte</button>
        </div>
      </header>

      <main id="accueil">
        <section className="griot-hero">
          <p className="griot-eyebrow">MÉMOIRE NUMÉRIQUE · TRANSMISSION FAMILIALE</p>
          <h1>Découvrez votre histoire.<br /><em>Transmettez-la au monde.</em></h1>
          <p className="griot-hero-copy">
            GRIOT vous aide à préserver les récits, les liens et les origines de votre famille,
            génération après génération.
          </p>
          <div className="griot-hero-actions">
            <button className="griot-button griot-button-primary" onClick={onRegister}>Créer mon arbre</button>
            <button className="griot-button griot-button-outline" onClick={() => document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' })}>
              Explorer les familles publiques
            </button>
          </div>

          <div className="griot-tree-ornament" aria-hidden="true">
            <svg viewBox="0 0 280 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className="griot-illustration-ground" d="M37 265h206" />
              <path className="griot-illustration-trunk" d="M140 264V145m0 54-66-58m66 39 66-57m-66 18-1-76" />
              <path className="griot-illustration-branch" d="m74 141-24-25m24 25 24-25m108 2-23-25m23 25 24-24m-90-67-22-22m22 22 22-22" />
              <path className="griot-illustration-leaf" d="M35 105c14-19 31-18 39 0-13 18-30 19-39 0Zm54-5c13-19 31-18 39 0-13 18-30 19-39 0Zm62-35c14-19 31-18 39 0-13 18-30 19-39 0Zm52 16c14-19 31-18 39 0-13 18-30 19-39 0ZM118 32c14-19 31-18 39 0-13 18-30 19-39 0Z" />
              <g className="griot-illustration-portraits">
                <circle cx="74" cy="142" r="20" />
                <circle cx="206" cy="123" r="20" />
                <circle cx="139" cy="58" r="20" />
                <path d="M58 148c2-9 8-13 16-13s14 4 16 13m100-13c2-9 8-13 16-13s14 4 16 13M123 64c2-9 8-13 16-13s14 4 16 13" />
              </g>
              <circle className="griot-illustration-fruit" cx="139" cy="214" r="7" />
              <circle className="griot-illustration-fruit" cx="111" cy="232" r="5" />
              <circle className="griot-illustration-fruit" cx="168" cy="232" r="5" />
            </svg>
          </div>
        </section>

        <section className="griot-home-features">
          <article><span>01</span><h2>Relier les générations</h2><p>Construisez un arbre familial vivant avec vos proches.</p></article>
          <article><span>02</span><h2>Préserver les récits</h2><p>Gardez biographies, souvenirs et archives au même endroit.</p></article>
          <article><span>03</span><h2>Partager avec confiance</h2><p>Choisissez qui peut consulter et enrichir votre mémoire.</p></article>
        </section>

        <section className="griot-explorer" id="explorer">
          <div>
            <p className="griot-eyebrow">EXPLORATION PUBLIQUE</p>
            <h2>Une histoire de famille vous attend.</h2>
            <section className="griot-home-public-trees" aria-label="Des arbres pour découvrir GRIOT">
              <p>Entrez dans ces histoires et découvrez comment relier les générations, les lieux et les langues. Ces familles fictives sont de vrais arbres publics enregistrés dans GRIOT.</p>
              {presentationsLoading && <p role="status">Les familles vous ouvrent leurs portes…</p>}
              {presentationsError && <div role="alert"><p>Les arbres publics n’ont pas pu être chargés.</p><button className="griot-button griot-button-outline" onClick={() => setRetry((value) => value + 1)}>Réessayer</button></div>}
              {!presentationsLoading && !presentationsError && !presentations.length && <p>Les premières histoires publiques arrivent bientôt.</p>}
              <div className="griot-home-public-grid">{presentations.map((tree, index) => <article key={tree.id}><span className="griot-eyebrow">HISTOIRE 0{index + 1}</span><h3>{tree.nom}</h3><p>{tree.introductionPublique}</p><small>{tree._count.personnes} personnes · Arbre public</small><a className="griot-button griot-button-primary" href={`#/arbres-publics/${tree.id}`}>Découvrir cette famille →</a></article>)}</div>
            </section>
            <p>Seuls les arbres que leurs propriétaires ont rendus publics apparaissent ici.</p>
          </div>
          <form className="griot-search-form" onSubmit={searchFamilies}>
            <label htmlFor="public-family-search">Nom d’une famille</label>
            <div className="griot-search-row">
              <input
                id="public-family-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Mvondo, Ateba, un village…"
                maxLength={100}
              />
              <button className="griot-button griot-button-primary" disabled={loading}>
                {loading ? 'Recherche…' : 'Rechercher'}
              </button>
            </div>
          </form>

          {error && <p className="griot-inline-error" role="alert">{error}</p>}
          {searched && !error && (
            <div className="griot-public-results" aria-live="polite">
              {families.length === 0 ? (
                <p>Aucun arbre public ne correspond à cette recherche.</p>
              ) : families.map((family) => (
                <article key={family.id} className="griot-public-result">
                  <span className="griot-result-mark">{family.nom.slice(0, 1).toUpperCase()}</span>
                  <div><h3>{family.nom}</h3><p>{family._count.personnes} personne{family._count.personnes === 1 ? '' : 's'} · Arbre public</p></div>
                  <button className="griot-text-button" onClick={onLogin}>Se connecter pour continuer</button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
