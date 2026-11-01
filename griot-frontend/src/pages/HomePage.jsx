import { useState } from 'react';
import api from '../api/client';

export default function HomePage({ onLogin, onRegister }) {
  const [query, setQuery] = useState('');
  const [families, setFamilies] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          <img src="/griot-logo.jpeg" alt="" />
          <span>GRIOT</span>
        </a>
        <div className="griot-home-actions">
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
            <span className="griot-tree-root">✦</span>
            <span className="griot-tree-branch branch-one" />
            <span className="griot-tree-branch branch-two" />
            <span className="griot-tree-branch branch-three" />
            <span className="griot-tree-leaf leaf-one">✦</span>
            <span className="griot-tree-leaf leaf-two">✦</span>
            <span className="griot-tree-leaf leaf-three">✦</span>
            <span className="griot-tree-leaf leaf-four">✦</span>
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

      <footer className="griot-home-footer">
        <span>© 2026 GAM Labs</span>
        <span>La mémoire des peuples, entre les mains des familles.</span>
      </footer>
    </div>
  );
}
