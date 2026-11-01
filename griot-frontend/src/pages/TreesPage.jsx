import React, { useState, useEffect } from 'react';
import api from '../api/client';

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
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingTree(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
          <div>
            <p className="griot-eyebrow">ESPACE FAMILIAL</p>
            <h1 className="text-3xl font-bold text-gray-900">{guidance ? 'Choisissez un arbre' : 'Vos arbres généalogiques'}</h1>
            <p className="mt-2 text-sm text-gray-600">{guidance ? 'Ouvrez un espace familial existant pour consulter cette page.' : 'Choisissez un arbre pour consulter ses personnes, ses récits et ses origines.'}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium"
          >
            {showCreateForm ? 'Annuler' : '+ Nouvel arbre'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <form onSubmit={handleCreateTree} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'arbre
                </label>
                <input
                  type="text"
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                  placeholder="Ex: Arbre généalogique Dupont"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tree-visibility">
                  Visibilité
                </label>
                <select
                  id="tree-visibility"
                  value={newTreeVisibility}
                  onChange={(event) => setNewTreeVisibility(event.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="prive">Privé — réservé aux membres invités</option>
                  <option value="public">Public — nom et nombre de personnes visibles dans l’exploration</option>
                </select>
                <p className="mt-2 text-xs text-gray-600">
                  Les profils et souvenirs restent réservés aux membres, même si l’arbre est public.
                </p>
              </div>
              <button
                type="submit"
                disabled={creatingTree}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
              >
                {creatingTree ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : trees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">Aucun arbre généalogique pour le moment</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
            >
              Créer le premier arbre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map((tree) => (
              <div
                key={tree.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer group"
              >
                <div
                  onClick={() => onSelectTree(tree.id)}
                  className="p-6 group-hover:bg-gray-50 transition"
                >
                  <h3 className="text-lg font-bold text-green-800 mb-2">{tree.nom}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Créé le {new Date(tree.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Visibilité: {tree.visibilite === 'prive' || tree.visibilite === 'privee' ? 'Privé' : 'Public'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTree(tree.id);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition text-sm font-medium"
                    >
                      Ouvrir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
