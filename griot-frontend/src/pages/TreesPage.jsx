import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/useAuth';

const panelGuidance = {
  genealogie: {
    eyebrow: 'ARBRE GÉNÉALOGIQUE',
    title: 'Les liens de votre famille, réunis en un seul arbre',
    description: 'Créez un arbre familial pour ajouter des personnes et relier les générations avec les informations transmises par vos proches.',
  },
  personnes: {
    eyebrow: 'FICHES PERSONNES',
    title: 'Chaque personne mérite son histoire',
    description: 'Les biographies, les dates et les liens familiaux seront rassemblés dans les profils de votre arbre.',
  },
  membres: {
    eyebrow: 'RÔLES & PERMISSIONS',
    title: 'Transmettez cette mémoire à plusieurs',
    description: 'Créez un arbre pour inviter vos proches et choisir leur rôle dans la construction de la mémoire familiale.',
  },
  origines: {
    eyebrow: 'ORIGINES FAMILIALES',
    title: 'Les lieux font partie de votre histoire',
    description: 'Les origines et les parcours apparaîtront à mesure que vous ajouterez des lieux aux profils de votre arbre.',
  },
  souvenirs: {
    eyebrow: 'MÉMOIRE FAMILIALE',
    title: 'Préservez les récits et les souvenirs',
    description: 'Les histoires, traditions et archives trouveront leur place dans l’espace mémoire de votre arbre.',
  },
  chefferie: {
    eyebrow: 'TRANSMISSION & CONFIANCE',
    title: 'Documentez la transmission en famille',
    description: 'L’espace de gouvernance rassemble les preuves et les demandes de vérification associées à un arbre.',
  },
  assistant: {
    eyebrow: 'ASSISTANT FAMILIAL',
    title: 'Posez des questions sur votre mémoire familiale',
    description: 'GRIOT pourra vous aider à explorer les informations que votre famille aura enregistrées dans un arbre.',
  },
};

const setupSteps = [
  { number: '01', title: 'Créez votre arbre', description: 'Donnez un nom à votre espace familial.' },
  { number: '02', title: 'Ajoutez vos proches', description: 'Construisez les profils et les liens à votre rythme.' },
  { number: '03', title: 'Transmettez vos récits', description: 'Rassemblez souvenirs, lieux et archives.' },
];

export default function TreesPage({ activePanel = 'tableau', onSelectTree }) {
  const { user } = useAuth();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTreeName, setNewTreeName] = useState('');
  const [newTreeVisibility, setNewTreeVisibility] = useState('prive');
  const [creatingTree, setCreatingTree] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const guidance = panelGuidance[activePanel];

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (guidance && trees.length === 1) {
      onSelectTree(trees[0].id);
    }
  }, [activePanel, guidance, onSelectTree, trees]);

  const loadTrees = async () => {
    try {
      setLoading(true);
      const response = await api.getArbres();
      setTrees(Array.isArray(response) ? response : response.arbres || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = async (e) => {
    e.preventDefault();
    if (!newTreeName.trim()) return;

    try {
      setCreatingTree(true);
      const response = await api.createArbre(newTreeName.trim(), newTreeVisibility);
      setTrees([...trees, response]);
      setNewTreeName('');
      setNewTreeVisibility('prive');
      setShowCreateForm(false);
      onSelectTree(response.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingTree(false);
    }
  };

  return (
    <div className="griot-trees-page">
      <main className="griot-trees-content">
        {!guidance && <section className="griot-overview-hero">
          <div><p className="griot-eyebrow">LE FIL DE VOTRE HISTOIRE</p><h1>Bonjour {user?.prenom || ''},<br />la mémoire se cultive ensemble.</h1><p>Retrouvez vos espaces familiaux, faites grandir vos liens et laissez une trace de ce qui vous rassemble.</p><button className="griot-button griot-button-primary" onClick={() => trees.length ? onSelectTree(trees[0].id) : setShowCreateForm(true)}>{trees.length ? 'Retrouver ma famille →' : 'Commencer mon histoire →'}</button></div>
          <div className="griot-overview-art" aria-hidden="true"><span>✦</span><i /><i /><i /><p>Préserver.<br />Transmettre.<br />Relier.</p></div>
        </section>}
        {!guidance && !loading && <div className="griot-overview-stats">
          <article><strong>{trees.length}</strong><span>Arbre{trees.length > 1 ? 's' : ''} familial{trees.length > 1 ? 'aux' : ''}</span><small>Vos espaces de transmission</small></article>
          <article><strong>{new Set(trees.flatMap((tree) => (tree.membres || []).filter((m) => m.statut === 'actif').map((m) => m.utilisateurId))).size}</strong><span>Personnes participantes</span><small>Comptes actifs dans vos arbres</small></article>
          <article><strong>{trees.filter((tree) => ['prive', 'privee'].includes(tree.visibilite)).length}</strong><span>Arbres privés</span><small>Accessibles aux membres invités</small></article>
        </div>}
        {guidance ? (
          <section className="griot-select-tree griot-module-empty">
            <div>
              <p className="griot-eyebrow">{guidance.eyebrow}</p>
              <h2>{guidance.title}</h2>
              <p>{guidance.description}</p>
            </div>
            <button className="griot-button griot-button-primary" onClick={() => setShowCreateForm(true)}>
              Créer un arbre
            </button>
          </section>
        ) : !loading && trees.length === 0 ? (
          <section className="griot-first-tree">
            <div className="griot-first-tree-intro">
              <p className="griot-eyebrow">VOTRE ESPACE FAMILIAL</p>
              <h2>Votre histoire familiale commence ici.</h2>
              <p>Créez votre arbre pour réunir les personnes, les récits et les origines qui comptent pour votre famille.</p>
              <button className="griot-button griot-button-primary" onClick={() => setShowCreateForm(true)}>
                Créer mon premier arbre
              </button>
            </div>
            <div className="griot-first-tree-steps" aria-label="Les étapes pour commencer">
              {setupSteps.map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.description}</p></div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="griot-trees-header">
          <div>
            <p className="griot-eyebrow">ESPACE FAMILIAL</p>
            <h1>{guidance ? 'Choisissez un arbre' : 'Vos arbres généalogiques'}</h1>
            <p>{guidance ? 'Ouvrez un espace familial existant pour consulter cette page.' : 'Ouvrez un arbre pour retrouver son tableau de bord, ses anniversaires et les prochaines étapes de votre histoire.'}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="griot-button griot-button-primary griot-new-tree-button"
          >
            {showCreateForm ? 'Annuler' : '+ Nouvel arbre'}
          </button>
        </div>

        {error && (
          <div className="griot-inline-error" role="alert">
            {error}
          </div>
        )}

        {showCreateForm && (
          <section className="griot-tree-form-card">
            <div className="griot-section-heading">
              <div>
                <h2>Créer un arbre familial</h2>
                <p>Commencez par un nom ; vous pourrez inviter vos proches ensuite.</p>
              </div>
            </div>
            <form onSubmit={handleCreateTree} className="griot-tree-form">
              <label className="griot-tree-field">
                <span>
                  Nom de l'arbre
                  <span className="griot-required-mark" aria-hidden="true"> *</span>
                </span>
                <input
                  type="text"
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                  placeholder="Ex: Arbre généalogique Dupont"
                  required
                  maxLength={120}
                />
              </label>
              <label className="griot-tree-field">
                <span>Visibilité</span>
                <select
                  id="tree-visibility"
                  value={newTreeVisibility}
                  onChange={(event) => setNewTreeVisibility(event.target.value)}
                >
                  <option value="prive">Privé — réservé aux membres invités</option>
                  <option value="public">Public — nom et nombre de personnes visibles dans l’exploration</option>
                </select>
                <small>Les profils et souvenirs restent réservés aux membres, même si l’arbre est public.</small>
              </label>
              <div className="griot-tree-form-actions">
                <button type="button" className="griot-button griot-button-quiet" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </button>
                <button type="submit" className="griot-button griot-button-primary" disabled={creatingTree}>
                  {creatingTree ? 'Création…' : 'Créer l’arbre'}
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <div className="griot-trees-loading" role="status" aria-label="Chargement des arbres">
            <span />
          </div>
        ) : trees.length === 0 ? (
          <p className="griot-trees-empty">Aucun arbre généalogique pour le moment. Votre premier arbre apparaîtra ici.</p>
        ) : (
          <div className="griot-tree-grid">
            {trees.map((tree) => (
              <article key={tree.id} className="griot-tree-card">
                <div className="griot-tree-card-mark" aria-hidden="true">✦</div>
                <div className="griot-tree-card-content">
                  <h2>{tree.nom}</h2>
                  <p>
                    Créé le {new Date(tree.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                  <span className="griot-tree-visibility">
                    {tree.visibilite === 'prive' || tree.visibilite === 'privee' ? 'Privé' : 'Public'}
                  </span>
                </div>
                <button className="griot-button griot-button-outline griot-tree-open" onClick={() => onSelectTree(tree.id)}>
                  Ouvrir l’arbre <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
