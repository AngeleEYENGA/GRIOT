import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/useAuth';
import FamilyTreeView from '../components/FamilyTreeView';

export default function TreeDetailPage({ treeId, onBack }) {
  const { user } = useAuth();
  const [tree, setTree] = useState(null);
  const [personnes, setPersonnes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [membres, setMembers] = useState([]);
  const [souvenirs, setSouvenirs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tableau');
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddSouvenirForm, setShowAddSouvenirForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personDraft, setPersonDraft] = useState(null);
  const [editingPerson, setEditingPerson] = useState(false);
  const [savingPerson, setSavingPerson] = useState(false);
  const [personError, setPersonError] = useState('');
  const [personPhotos, setPersonPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photosRefresh, setPhotosRefresh] = useState(0);
  const [savingSouvenir, setSavingSouvenir] = useState(false);
  const [newPerson, setNewPerson] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    dateDeces: '',
    villageOrigine: '',
    biographie: '',
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
  const [newSouvenir, setNewSouvenir] = useState({
    titre: '',
    categorie: 'histoire',
    contenu: '',
    personneId: '',
  });

  const loadTreeData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [treeData, personnesData, relationsData, membresData, souvenirsData] = await Promise.all([
        api.getArbre(treeId),
        api.getPersonnes(treeId),
        api.getRelations(treeId),
        api.getMembers(treeId),
        api.getSouvenirs(treeId),
      ]);
      setTree(treeData);
      setPersonnes(Array.isArray(personnesData) ? personnesData : personnesData.personnes || []);
      setRelations(Array.isArray(relationsData) ? relationsData : relationsData.relations || []);
      setMembers(Array.isArray(membresData) ? membresData : membresData.membres || []);
      setSouvenirs(Array.isArray(souvenirsData) ? souvenirsData : souvenirsData.souvenirs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [treeId]);

  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  useEffect(() => {
    if (activeTab !== 'tableau') return undefined;

    let cancelled = false;
    setDashboardLoading(true);
    api.getTreeDashboard(treeId)
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setDashboardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, treeId]);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!newPerson.nom.trim() || !newPerson.prenom.trim()) return;

    try {
      const response = await api.createPersonne(treeId, {
        ...newPerson,
        dateNaissance: newPerson.dateNaissance || undefined,
        dateDeces: newPerson.dateDeces || undefined,
        villageOrigine: newPerson.villageOrigine.trim() || undefined,
        biographie: newPerson.biographie.trim() || undefined,
      });
      setPersonnes([...personnes, response]);
      setNewPerson({
        nom: '',
        prenom: '',
        dateNaissance: '',
        dateDeces: '',
        villageOrigine: '',
        biographie: '',
      });
      setShowAddPersonForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const openPersonProfile = (person) => {
    setSelectedPerson(person);
    setPersonDraft({
      nom: person.nom || '',
      prenom: person.prenom || '',
      dateNaissance: person.dateNaissance ? new Date(person.dateNaissance).toISOString().slice(0, 10) : '',
      dateDeces: person.dateDeces ? new Date(person.dateDeces).toISOString().slice(0, 10) : '',
      villageOrigine: person.villageOrigine || '',
      biographie: person.biographie || '',
    });
    setEditingPerson(false);
    setPersonError('');
    setError('');
  };

  const handleSavePerson = async (e) => {
    e.preventDefault();
    if (!selectedPerson || !personDraft) return;

    try {
      setSavingPerson(true);
      setPersonError('');
      const response = await api.updatePersonne(treeId, selectedPerson.id, {
        ...personDraft,
        dateNaissance: personDraft.dateNaissance || null,
        dateDeces: personDraft.dateDeces || null,
      });
      setPersonnes((current) => current.map((person) => (
        person.id === response.id ? response : person
      )));
      setSelectedPerson(response);
      setEditingPerson(false);
    } catch (err) {
      setPersonError(err.message);
    } finally {
      setSavingPerson(false);
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

  const handleAddSouvenir = async (e) => {
    e.preventDefault();
    if (!newSouvenir.titre.trim()) return;

    try {
      setSavingSouvenir(true);
      setError('');
      const response = await api.createSouvenir(treeId, {
        ...newSouvenir,
        titre: newSouvenir.titre.trim(),
        contenu: newSouvenir.contenu.trim() || undefined,
        personneId: newSouvenir.personneId || undefined,
      });
      setSouvenirs((current) => [response, ...current]);
      setNewSouvenir({ titre: '', categorie: 'histoire', contenu: '', personneId: '' });
      setShowAddSouvenirForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSouvenir(false);
    }
  };

  const handleDeleteSouvenir = async (souvenirId) => {
    if (!window.confirm('Supprimer ce souvenir ?')) return;
    try {
      await api.deleteSouvenir(treeId, souvenirId);
      setSouvenirs((current) => current.filter((souvenir) => souvenir.id !== souvenirId));
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
  const selectedPersonId = selectedPerson?.id;

  useEffect(() => {
    if (!selectedPersonId) {
      setPersonPhotos([]);
      return undefined;
    }

    let cancelled = false;
    const objectUrls = [];
    const loadPhotos = async () => {
      setPhotosLoading(true);
      try {
        const photos = await api.getPersonPhotos(treeId, selectedPersonId);
        const loadedPhotos = [];
        for (const photo of photos) {
          const blob = await api.getPersonPhotoBlob(treeId, photo.id);
          if (cancelled) return;
          const src = URL.createObjectURL(blob);
          objectUrls.push(src);
          loadedPhotos.push({ ...photo, src });
        }
        if (!cancelled) setPersonPhotos(loadedPhotos);
      } catch (err) {
        if (!cancelled) setPersonError(err.message);
      } finally {
        if (!cancelled) setPhotosLoading(false);
      }
    };

    loadPhotos();
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedPersonId, treeId, photosRefresh]);

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPersonId) return;

    try {
      setUploadingPhoto(true);
      setPersonError('');
      await api.uploadPersonPhoto(treeId, selectedPersonId, file);
      setPhotosRefresh((current) => current + 1);
    } catch (err) {
      setPersonError(err.message);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

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
          <div className="flex gap-8 overflow-x-auto whitespace-nowrap">
            {['tableau', 'genealogie', 'personnes', 'relations', 'souvenirs', 'membres'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition ${
                  activeTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'tableau' && '📊 Tableau de bord'}
                {tab === 'genealogie' && '🌳 Généalogie'}
                {tab === 'personnes' && '👤 Personnes'}
                {tab === 'relations' && '🤝 Relations'}
                {tab === 'souvenirs' && '📜 Souvenirs'}
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

        {activeTab === 'tableau' && (
          <section aria-labelledby="dashboard-title">
            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
              <div>
                <h2 id="dashboard-title" className="text-2xl font-bold text-gray-900">Votre arbre prend vie</h2>
                <p className="text-gray-600 mt-1">Une progression calculée à partir des informations déjà partagées.</p>
              </div>
            </div>
            {dashboardLoading && <p className="text-gray-600">Mise à jour de la progression...</p>}
            {dashboard && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  {[
                    ['Personnes', dashboard.statistiques.personnes],
                    ['Liens familiaux', dashboard.statistiques.relations],
                    ['Souvenirs', dashboard.statistiques.souvenirs],
                    ['Collaborateurs', dashboard.statistiques.membres],
                    ['Progression', `${dashboard.completude.pourcentage}%`],
                  ].map(([label, value]) => (
                    <article key={label} className="bg-white rounded-lg shadow p-5">
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="text-2xl font-bold text-green-800 mt-2">{value}</p>
                    </article>
                  ))}
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Complétude de l’arbre</h3>
                    <span className="text-sm text-gray-600">
                      {dashboard.completude.missionsTerminees}/{dashboard.completude.totalMissions} missions
                    </span>
                  </div>
                  <div
                    className="h-3 bg-gray-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label="Complétude de l’arbre"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={dashboard.completude.pourcentage}
                  >
                    <div
                      className="h-full bg-green-600 rounded-full transition-all"
                      style={{ width: `${dashboard.completude.pourcentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dashboard.missions.map((mission) => (
                    <article key={mission.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{mission.libelle}</h3>
                          <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
                        </div>
                        <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${
                          mission.terminee
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {mission.terminee ? 'Terminée' : 'À faire'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-5">
                        <span className="text-sm text-gray-500">
                          {mission.progression}/{mission.objectif}
                        </span>
                        <button
                          onClick={() => setActiveTab(mission.onglet)}
                          className="text-sm font-medium text-green-700 hover:text-green-900"
                        >
                          {mission.terminee ? 'Consulter' : 'Continuer'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === 'genealogie' && (
          <FamilyTreeView
            personnes={personnes}
            relations={relations}
            onOpenProfile={openPersonProfile}
          />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de décès (optionnel)
                      </label>
                      <input
                        type="date"
                        value={newPerson.dateDeces}
                        onChange={(e) => setNewPerson({ ...newPerson, dateDeces: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village d’origine (optionnel)
                      </label>
                      <input
                        type="text"
                        value={newPerson.villageOrigine}
                        onChange={(e) => setNewPerson({ ...newPerson, villageOrigine: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biographie (optionnelle)
                    </label>
                    <textarea
                      value={newPerson.biographie}
                      onChange={(e) => setNewPerson({ ...newPerson, biographie: e.target.value })}
                      rows={4}
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
                    {person.biographie && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{person.biographie}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openPersonProfile(person)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
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
                    <option value="parent">Parent (personne 1 → personne 2)</option>
                    <option value="enfant">Enfant (personne 1 → personne 2)</option>
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
            {peutGererArbre && (
              <p className="text-sm text-gray-500 mb-4">
                Pour « Parent », la première personne est le parent de la seconde ; « Enfant » inverse ce sens.
              </p>
            )}
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

        {activeTab === 'souvenirs' && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mémoire familiale</h2>
                <p className="text-sm text-gray-600 mt-1">Histoires et traditions transmises dans la famille.</p>
              </div>
              {peutAjouterPersonne && (
                <button
                  onClick={() => setShowAddSouvenirForm(!showAddSouvenirForm)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium"
                >
                  {showAddSouvenirForm ? 'Annuler' : '+ Raconter un souvenir'}
                </button>
              )}
            </div>

            {showAddSouvenirForm && (
              <form onSubmit={handleAddSouvenir} className="mb-8 bg-white rounded-lg shadow p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="souvenir-titre">
                      Titre
                    </label>
                    <input
                      id="souvenir-titre"
                      type="text"
                      value={newSouvenir.titre}
                      onChange={(e) => setNewSouvenir({ ...newSouvenir, titre: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      maxLength={160}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="souvenir-categorie">
                      Catégorie
                    </label>
                    <select
                      id="souvenir-categorie"
                      value={newSouvenir.categorie}
                      onChange={(e) => setNewSouvenir({ ...newSouvenir, categorie: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="histoire">Histoire</option>
                      <option value="cuisine">Cuisine</option>
                      <option value="danse">Danse</option>
                      <option value="musique">Musique</option>
                      <option value="proverbe">Proverbe</option>
                      <option value="mariage">Mariage</option>
                      <option value="funerailles">Funérailles</option>
                      <option value="naissance">Naissance</option>
                      <option value="vetements">Vêtements</option>
                      <option value="rituel">Rituel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="souvenir-personne">
                    Personne associée (optionnel)
                  </label>
                  <select
                    id="souvenir-personne"
                    value={newSouvenir.personneId}
                    onChange={(e) => setNewSouvenir({ ...newSouvenir, personneId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Toute la famille</option>
                    {personnes.map((personne) => (
                      <option key={personne.id} value={personne.id}>{personne.prenom} {personne.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="souvenir-contenu">
                    Récit (optionnel)
                  </label>
                  <textarea
                    id="souvenir-contenu"
                    value={newSouvenir.contenu}
                    onChange={(e) => setNewSouvenir({ ...newSouvenir, contenu: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={5}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingSouvenir}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition"
                >
                  {savingSouvenir ? 'Enregistrement...' : 'Enregistrer le souvenir'}
                </button>
              </form>
            )}

            {souvenirs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">Aucun souvenir partagé pour le moment.</p>
                {peutAjouterPersonne && (
                  <p className="text-sm text-gray-500 mt-2">Ajoutez une histoire, une recette ou une tradition pour commencer.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {souvenirs.map((souvenir) => (
                  <article key={souvenir.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-medium capitalize">
                          {souvenir.categorie}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-3">{souvenir.titre}</h3>
                      </div>
                      {peutGererArbre && (
                        <button
                          onClick={() => handleDeleteSouvenir(souvenir.id)}
                          aria-label={`Supprimer ${souvenir.titre}`}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    {souvenir.contenu && (
                      <p className="mt-3 text-gray-700 whitespace-pre-wrap">{souvenir.contenu}</p>
                    )}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                      <span>
                        {souvenir.personne
                          ? `${souvenir.personne.prenom} ${souvenir.personne.nom}`
                          : 'Mémoire familiale'}
                        {souvenir.auteur && ` · partagé par ${souvenir.auteur.prenom} ${souvenir.auteur.nom}`}
                      </span>
                      <span>
                        {souvenir.statutVerification === 'verifie_famille'
                          ? 'Vérifié par la famille'
                          : souvenir.statutVerification === 'verifie_chefferie'
                            ? 'Vérifié par la chefferie'
                            : 'À vérifier'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
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
      {selectedPerson && personDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="person-profile-title"
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <header className="flex justify-between items-start gap-4 p-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-green-700 font-medium">Profil familial</p>
                <h2 id="person-profile-title" className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedPerson.prenom} {selectedPerson.nom}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                aria-label="Fermer le profil"
                className="text-gray-500 hover:text-gray-900 text-2xl leading-none"
              >
                ×
              </button>
            </header>

            {personError && (
              <p role="alert" className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {personError}
              </p>
            )}

            {editingPerson ? (
              <form onSubmit={handleSavePerson} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Prénom
                    <input
                      value={personDraft.prenom}
                      onChange={(e) => setPersonDraft({ ...personDraft, prenom: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Nom
                    <input
                      value={personDraft.nom}
                      onChange={(e) => setPersonDraft({ ...personDraft, nom: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Date de naissance
                    <input
                      type="date"
                      value={personDraft.dateNaissance}
                      onChange={(e) => setPersonDraft({ ...personDraft, dateNaissance: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </label>
                  <label className="text-sm font-medium text-gray-700">
                    Date de décès
                    <input
                      type="date"
                      value={personDraft.dateDeces}
                      onChange={(e) => setPersonDraft({ ...personDraft, dateDeces: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  Village d’origine
                  <input
                    value={personDraft.villageOrigine}
                    onChange={(e) => setPersonDraft({ ...personDraft, villageOrigine: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Biographie
                  <textarea
                    value={personDraft.biographie}
                    onChange={(e) => setPersonDraft({ ...personDraft, biographie: e.target.value })}
                    rows={6}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </label>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPerson(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingPerson}
                    className="px-4 py-2 text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 rounded-lg"
                  >
                    {savingPerson ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6">
                <section>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-gray-900">Photographies privées</h3>
                    {peutAjouterPersonne && (
                      <label className="px-3 py-2 text-sm text-white bg-green-700 hover:bg-green-800 rounded-lg cursor-pointer">
                        {uploadingPhoto ? 'Envoi...' : 'Ajouter une photo'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={uploadingPhoto}
                          onChange={handleUploadPhoto}
                        />
                      </label>
                    )}
                  </div>
                  {photosLoading ? (
                    <p className="mt-2 text-sm text-gray-500">Chargement des photos...</p>
                  ) : personPhotos.length ? (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {personPhotos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.src}
                          alt={`Photo de ${selectedPerson.prenom} ${selectedPerson.nom}`}
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">Aucune photo pour le moment.</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    JPEG, PNG ou WebP, 4 Mio maximum. Les photos sont visibles uniquement par les membres de l’arbre.
                  </p>
                </section>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Naissance</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedPerson.dateNaissance
                        ? new Date(selectedPerson.dateNaissance).toLocaleDateString('fr-FR')
                        : 'Non renseignée'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Décès</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedPerson.dateDeces
                        ? new Date(selectedPerson.dateDeces).toLocaleDateString('fr-FR')
                        : 'Non renseigné'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Village d’origine</dt>
                    <dd className="font-medium text-gray-900">{selectedPerson.villageOrigine || 'Non renseigné'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Vérification</dt>
                    <dd className="font-medium text-gray-900">
                      {selectedPerson.statutVerification === 'verifie_famille'
                        ? 'Vérifié par la famille'
                        : selectedPerson.statutVerification === 'verifie_chefferie'
                          ? 'Vérifié par la chefferie'
                          : 'À vérifier'}
                    </dd>
                  </div>
                </dl>
                <section>
                  <h3 className="font-semibold text-gray-900">Biographie</h3>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                    {selectedPerson.biographie || 'Aucune biographie enregistrée.'}
                  </p>
                </section>
                <section>
                  <h3 className="font-semibold text-gray-900">Liens familiaux</h3>
                  <ul className="mt-2 space-y-2">
                    {relations
                      .filter((relation) => (
                        relation.personneId1 === selectedPerson.id
                        || relation.personneId2 === selectedPerson.id
                      ))
                      .map((relation) => {
                        const isFirstPerson = relation.personneId1 === selectedPerson.id;
                        const otherPersonId = isFirstPerson ? relation.personneId2 : relation.personneId1;
                        const otherPerson = personnes.find((person) => person.id === otherPersonId);
                        const relationType = isFirstPerson
                          ? relation.typeRelation
                          : relation.typeRelation === 'parent'
                            ? 'enfant'
                            : relation.typeRelation === 'enfant'
                              ? 'parent'
                              : relation.typeRelation;
                        return otherPerson ? (
                          <li key={relation.id} className="text-sm text-gray-700">
                            <span className="capitalize">{relationType}</span> : {otherPerson.prenom} {otherPerson.nom}
                          </li>
                        ) : null;
                      })}
                    {!relations.some((relation) => (
                      relation.personneId1 === selectedPerson.id
                      || relation.personneId2 === selectedPerson.id
                    )) && <li className="text-sm text-gray-500">Aucun lien familial enregistré.</li>}
                  </ul>
                </section>
                <section>
                  <h3 className="font-semibold text-gray-900">Souvenirs associés</h3>
                  <ul className="mt-2 space-y-2">
                    {souvenirs
                      .filter((souvenir) => (
                        souvenir.personneId === selectedPerson.id
                        || souvenir.personne?.id === selectedPerson.id
                      ))
                      .map((souvenir) => (
                        <li key={souvenir.id} className="text-sm text-gray-700">
                          <span className="font-medium">{souvenir.titre}</span>
                          {souvenir.categorie && ` · ${souvenir.categorie}`}
                        </li>
                      ))}
                    {!souvenirs.some((souvenir) => (
                      souvenir.personneId === selectedPerson.id
                      || souvenir.personne?.id === selectedPerson.id
                    )) && <li className="text-sm text-gray-500">Aucun souvenir associé.</li>}
                  </ul>
                </section>
                {peutGererArbre && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditingPerson(true)}
                      className="px-4 py-2 text-white bg-green-700 hover:bg-green-800 rounded-lg"
                    >
                      Modifier le profil
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
