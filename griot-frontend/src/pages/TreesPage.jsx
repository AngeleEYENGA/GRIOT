import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/useAuth';

export default function TreesPage({ onSelectTree, onLogout }) {
  const { user } = useAuth();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTreeName, setNewTreeName] = useState('');
  const [newTreeVisibility, setNewTreeVisibility] = useState('prive');
  const [creatingTree, setCreatingTree] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/griot-logo.jpeg" alt="" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-green-800">GRIOT</h1>
              <p className="text-sm text-gray-600">{user?.prenom} {user?.nom}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mes arbres généalogiques</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium"
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
