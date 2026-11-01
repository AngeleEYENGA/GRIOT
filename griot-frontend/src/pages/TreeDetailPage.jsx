import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/useAuth';

export default function TreeDetailPage({ treeId, onBack }) {
  const { user } = useAuth();
  const [tree, setTree] = useState(null);
  const [personnes, setPersonnes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [membres, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personnes');
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
  });
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'lecteur',
  });
  const [newRelation, setNewRelation] = useState({
    personneId1: '',
    personneId2: '',
    typeRelation: 'parent',
  });

  const loadTreeData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [treeData, personnesData, relationsData, membresData] = await Promise.all([
        api.getArbre(treeId),
        api.getPersonnes(treeId),
        api.getRelations(treeId),
        api.getMembers(treeId),
      ]);
      setTree(treeData);
      setPersonnes(Array.isArray(personnesData) ? personnesData : personnesData.personnes || []);
      setRelations(Array.isArray(relationsData) ? relationsData : relationsData.relations || []);
      setMembers(Array.isArray(membresData) ? membresData : membresData.membres || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!newPerson.nom.trim() || !newPerson.prenom.trim()) return;

    try {
      const response = await api.createPersonne(treeId, {
        ...newPerson,
        dateNaissance: newPerson.dateNaissance || undefined,
      });
      setPersonnes([...personnes, response]);
      setNewPerson({ nom: '', prenom: '', dateNaissance: '' });
      setShowAddPersonForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddRelation = async (e) => {
    e.preventDefault();
    if (!newRelation.personneId1 || !newRelation.personneId2 || newRelation.personneId1 === newRelation.personneId2) {
      setError('Choisissez deux personnes différentes.');
      return;
    }

    try {
      const relation = await api.createRelation(treeId, newRelation);
      setRelations([...relations, relation]);
      setNewRelation({ personneId1: '', personneId2: '', typeRelation: 'parent' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.email.trim()) return;

    try {
      const response = await api.inviteMembers(treeId, newMember.email, newMember.role);
      setMembers([...membres, response]);
      setNewMember({ email: '', role: 'lecteur' });
      setShowAddMemberForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePerson = async (personneId) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    try {
      await api.deletePersonne(treeId, personneId);
      setPersonnes(personnes.filter((p) => p.id !== personneId));
    } catch (err) {
      setError(err.message);
    }
  };

  const roleCourant = tree?.membres?.find((member) => member.utilisateurId === user?.id)?.role;
  const peutAjouterPersonne = ['admin', 'editeur', 'contributeur'].includes(roleCourant);
  const peutGererArbre = ['admin', 'editeur'].includes(roleCourant);
  const peutGererMembres = roleCourant === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Arbre non trouvé</p>
          <button onClick={onBack} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Retour
            </button>
          </div>
          <h1 className="text-3xl font-bold text-green-800">{tree.nom}</h1>
          <p className="text-gray-600 mt-1">
            {personnes.length} personne{personnes.length !== 1 ? 's' : ''} • {membres.length} membre{membres.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {['personnes', 'relations', 'membres'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'personnes' && '👤 Personnes'}
                {tab === 'relations' && '🤝 Relations'}
                {tab === 'membres' && '👥 Équipe'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* PERSONNES TAB */}
        {activeTab === 'personnes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Personnes</h2>
              {peutAjouterPersonne && <button
                onClick={() => setShowAddPersonForm(!showAddPersonForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium"
              >
                {showAddPersonForm ? 'Annuler' : '+ Ajouter une personne'}
              </button>}
            </div>

            {showAddPersonForm && (
              <div className="mb-8 bg-white rounded-lg shadow p-6">
                <form onSubmit={handleAddPerson} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        value={newPerson.nom}
                        onChange={(e) => setNewPerson({ ...newPerson, nom: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={newPerson.prenom}
                        onChange={(e) => setNewPerson({ ...newPerson, prenom: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance (optionnel)
                    </label>
                    <input
                      type="date"
                      value={newPerson.dateNaissance}
                      onChange={(e) => setNewPerson({ ...newPerson, dateNaissance: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Ajouter
                  </button>
                </form>
              </div>
            )}

            {personnes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Aucune personne ajoutée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personnes.map((person) => (
                  <div key={person.id} className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold text-lg text-gray-900">
                      {person.prenom} {person.nom}
                    </h3>
                    {person.dateNaissance && (
                      <p className="text-sm text-gray-600 mt-1">
                        Né(e) le {new Date(person.dateNaissance).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                        Détails
                      </button>
                      {peutGererArbre && <button
                        onClick={() => handleDeletePerson(person.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                      >
                        ✕
                      </button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RELATIONS TAB */}
        {activeTab === 'relations' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Relations familiales</h2>
              {peutGererArbre && personnes.length >= 2 && (
                <form onSubmit={handleAddRelation} className="flex flex-wrap gap-2">
                  <select
                    aria-label="Première personne"
                    value={newRelation.personneId1}
                    onChange={(e) => setNewRelation({ ...newRelation, personneId1: e.target.value })}
                    className="rounded border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Personne 1</option>
                    {personnes.map((person) => <option key={person.id} value={person.id}>{person.prenom} {person.nom}</option>)}
                  </select>
                  <select
                    aria-label="Type de relation"
                    value={newRelation.typeRelation}
                    onChange={(e) => setNewRelation({ ...newRelation, typeRelation: e.target.value })}
                    className="rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="parent">Parent</option>
                    <option value="enfant">Enfant</option>
                    <option value="conjoint">Conjoint</option>
                  </select>
                  <select
                    aria-label="Deuxième personne"
                    value={newRelation.personneId2}
                    onChange={(e) => setNewRelation({ ...newRelation, personneId2: e.target.value })}
                    className="rounded border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">Personne 2</option>
                    {personnes.map((person) => <option key={person.id} value={person.id}>{person.prenom} {person.nom}</option>)}
                  </select>
                  <button type="submit" className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700">
                    Ajouter le lien
                  </button>
                </form>
              )}
            </div>
            {relations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Aucune relation définie</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Personnes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relations.map((rel) => (
                      <tr key={rel.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {rel.typeRelation === 'parent' && '👨‍👩‍👧 Parent'}
                          {rel.typeRelation === 'enfant' && '👶 Enfant'}
                          {rel.typeRelation === 'conjoint' && '💑 Conjoint'}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {rel.personne1?.prenom} {rel.personne1?.nom} ↔ {rel.personne2?.prenom} {rel.personne2?.nom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MEMBRES TAB */}
        {activeTab === 'membres' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Équipe</h2>
              {peutGererMembres && <button
                onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium"
              >
                {showAddMemberForm ? 'Annuler' : '+ Inviter un collaborateur'}
              </button>}
            </div>

            {showAddMemberForm && (
              <div className="mb-8 bg-white rounded-lg shadow p-6">
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="lecteur">Lecteur (lecture seule)</option>
                      <option value="contributeur">Contributeur (ajouter/modifier)</option>
                      <option value="editeur">Éditeur (full access)</option>
                      <option value="admin">Admin (gestion équipe)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Inviter
                  </button>
                </form>
              </div>
            )}

            {membres.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Aucun collaborateur</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Rôle</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membres.map((member) => (
                      <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{member.utilisateur?.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{member.role}</td>
                        <td className="px-6 py-3 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              member.statut === 'actif'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {member.statut === 'actif' ? 'Actif' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
