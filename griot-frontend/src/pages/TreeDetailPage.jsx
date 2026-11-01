import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/useAuth';
import FamilyTreeView from '../components/FamilyTreeView';
import {
  AssistantPanel,
  GovernancePanel,
  OriginsPanel,
  StylePanel,
} from '../components/TreeExtraScreens';
import SouvenirInteractions from '../components/SouvenirInteractions';

function TreeMotif({ size = 120 }) {
  const angles = [-58, -30, 0, 30, 58];

  return (
    <svg aria-hidden="true" width={size} height={size * 1.3} viewBox="0 0 100 130">
      <line x1="50" y1="38" x2="50" y2="92" stroke="var(--griot-ink)" strokeWidth="3" />
      {angles.map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        const x = 50 + Math.sin(radians) * 32;
        const y = 38 - Math.cos(radians) * 30;

        return (
          <g key={`ancestor-${index}`}>
            <line x1="50" y1="38" x2={x} y2={y} stroke="var(--griot-ink)" strokeWidth="2.5" />
            <circle cx={x} cy={y} r={index === 2 ? 8 : 6.5} fill="var(--griot-gold)" stroke="var(--griot-ink)" strokeWidth="2" />
          </g>
        );
      })}
      {angles.map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        const x = 50 + Math.sin(radians) * 32;
        const y = 92 + Math.cos(radians) * 30;

        return (
          <g key={`descendant-${index}`}>
            <line x1="50" y1="92" x2={x} y2={y} stroke="var(--griot-ink)" strokeWidth="2.5" />
            <circle cx={x} cy={y} r={index === 2 ? 8 : 6.5} fill="var(--griot-terracotta)" stroke="var(--griot-ink)" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}

function MemoryVerificationBadge({ status }) {
  const verification = status === 'verifie_famille'
    ? { label: 'Vérifié par la famille', className: 'is-family', icon: 'family' }
    : status === 'verifie_chefferie'
      ? { label: 'Vérifié par la chefferie', className: 'is-institution', icon: 'institution' }
      : { label: 'À vérifier', className: 'is-pending', icon: 'pending' };

  return (
    <span className={`griot-memory-verification ${verification.className}`}>
      <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {verification.icon === 'family' && (
          <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="10" cy="7" r="4" />
            <path d="m16 11 2 2 4-4" />
          </>
        )}
        {verification.icon === 'institution' && (
          <>
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M5 10v11m14-11v11M9 10v11m6-11v11" />
          </>
        )}
        {verification.icon === 'pending' && (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5m0-8h.01" />
          </>
        )}
      </svg>
      {verification.label}
    </span>
  );
}

export default function TreeDetailPage({ treeId, onBack, activeTab: activeTabProp, onTabChange }) {
  const { user } = useAuth();
  const [tree, setTree] = useState(null);
  const [personnes, setPersonnes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [membres, setMembers] = useState([]);
  const [souvenirs, setSouvenirs] = useState([]);
  const [migrations, setMigrations] = useState([]);
  const [preuves, setPreuves] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallbackTab, setFallbackTab] = useState('tableau');
  const activeTab = activeTabProp ?? fallbackTab;
  const setActiveTab = (tab) => {
    setFallbackTab(tab);
    onTabChange?.(tab);
  };
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddSouvenirForm, setShowAddSouvenirForm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personProfileTab, setPersonProfileTab] = useState('bio');
  const [personDraft, setPersonDraft] = useState(null);
  const [editingPerson, setEditingPerson] = useState(false);
  const [savingPerson, setSavingPerson] = useState(false);
  const [personError, setPersonError] = useState('');
  const [personPhotos, setPersonPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photosRefresh, setPhotosRefresh] = useState(0);
  const [savingSouvenir, setSavingSouvenir] = useState(false);
  const [newSouvenirAudio, setNewSouvenirAudio] = useState(null);
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
  const [souvenirView, setSouvenirView] = useState('histoires');
  const [dashboardSearch, setDashboardSearch] = useState('');

  const loadTreeData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [treeData, personnesData, relationsData, membresData, souvenirsData, migrationsData, preuvesData, institutionData] = await Promise.all([
        api.getArbre(treeId),
        api.getPersonnes(treeId),
        api.getRelations(treeId),
        api.getMembers(treeId),
        api.getSouvenirs(treeId),
        api.getMigrations(treeId),
        api.getProofs(treeId),
        api.getInstitution(treeId),
      ]);
      setTree(treeData);
      setPersonnes(Array.isArray(personnesData) ? personnesData : personnesData.personnes || []);
      setRelations(Array.isArray(relationsData) ? relationsData : relationsData.relations || []);
      setMembers(Array.isArray(membresData) ? membresData : membresData.membres || []);
      setSouvenirs(Array.isArray(souvenirsData) ? souvenirsData : souvenirsData.souvenirs || []);
      setMigrations(Array.isArray(migrationsData) ? migrationsData : []);
      setPreuves(Array.isArray(preuvesData) ? preuvesData : []);
      setInstitution(institutionData);
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
    setPersonProfileTab('bio');
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
      const audioFile = newSouvenirAudio;
      setNewSouvenirAudio(null);
      setShowAddSouvenirForm(false);
      if (audioFile) {
        try {
          const uploadedMedia = await api.uploadSouvenirMedia(treeId, response.id, audioFile);
          setSouvenirs((current) => current.map((souvenir) => (
            souvenir.id === response.id
              ? { ...souvenir, medias: [uploadedMedia] }
              : souvenir
          )));
        } catch (uploadError) {
          setError(`Le souvenir a été enregistré, mais l’enregistrement audio n’a pas pu être téléversé : ${uploadError.message}`);
        }
      }
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

  const handleUpdateMemberRole = async (memberId, role) => {
    setError('');
    try {
      const updatedMember = await api.updateMemberRole(treeId, memberId, role);
      setMembers((current) => current.map((member) => (
        member.id === updatedMember.id ? { ...member, ...updatedMember } : member
      )));
    } catch (err) {
      setError(err.message);
    }
  };

  const roleCourant = tree?.membres?.find((member) => member.utilisateurId === user?.id)?.role;
  const peutAjouterPersonne = ['admin', 'editeur', 'contributeur'].includes(roleCourant);
  const peutGererArbre = ['admin', 'editeur'].includes(roleCourant);
  const peutGererMembres = roleCourant === 'admin';
  const selectedPersonId = selectedPerson?.id;
  const recentSouvenirs = [...souvenirs]
    .sort((first, second) => new Date(second.dateCreation || 0) - new Date(first.dateCreation || 0))
    .slice(0, 4);
  const displayedSouvenirs = (souvenirView === 'traditions'
    ? souvenirs.filter((souvenir) => souvenir.categorie !== 'histoire')
    : [...souvenirs])
    .sort((first, second) => souvenirView === 'frise'
      ? new Date(first.dateCreation || 0) - new Date(second.dateCreation || 0)
      : new Date(second.dateCreation || 0) - new Date(first.dateCreation || 0));
  const searchResults = dashboardSearch.trim()
    ? personnes.filter((person) => `${person.prenom} ${person.nom} ${person.villageOrigine || ''}`
      .toLocaleLowerCase('fr')
      .includes(dashboardSearch.trim().toLocaleLowerCase('fr')))
    : [];
  const firstOrigin = migrations[0];
  const originLabel = firstOrigin
    ? `${firstOrigin.lieu.nom}${firstOrigin.lieu.pays ? `, ${firstOrigin.lieu.pays}` : ''}`
    : personnes.find((person) => person.villageOrigine)?.villageOrigine;

  const openAddPerson = () => {
    setActiveTab('personnes');
    setShowAddPersonForm(true);
  };

  const openAddSouvenir = () => {
    setActiveTab('souvenirs');
    setShowAddSouvenirForm(true);
  };

  const openAddMedia = () => {
    if (personnes[0]) {
      setActiveTab('personnes');
      openPersonProfile(personnes[0]);
    } else {
      openAddPerson();
    }
  };

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
        const photos = await api.getPersonMedias(treeId, selectedPersonId);
        const loadedPhotos = [];
        for (const photo of photos) {
          const blob = await api.getPersonMediaBlob(treeId, photo.id);
          if (cancelled) return;
          const src = URL.createObjectURL(blob);
          objectUrls.push(src);
          loadedPhotos.push({ ...photo, src, contentType: blob.type });
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
      await api.uploadPersonMedia(treeId, selectedPersonId, file);
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
          <button onClick={onBack} className="griot-button griot-button-primary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="griot-tree-workspace">
      {/* Header */}
      <header className="griot-detail-header bg-white border-b border-gray-200">
        <div className="griot-detail-header-inner">
          <div className="griot-tree-detail-head-row">
            <button
              onClick={onBack}
              className="griot-tree-back-button"
            >
              ← Retour
            </button>
          </div>
          <h1>{tree.nom}</h1>
          <p className="griot-tree-detail-summary">
            {personnes.length} personne{personnes.length !== 1 ? 's' : ''} • {membres.length} membre{membres.length !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="griot-detail-tabs">
        <div className="griot-detail-tabs-inner">
          <div className="griot-detail-tab-list">
            {['tableau', 'genealogie', 'personnes', 'relations', 'souvenirs', 'membres', 'origines', 'chefferie', 'assistant', 'style'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`griot-detail-tab${activeTab === tab ? ' is-active' : ''}`}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                {tab === 'tableau' && '📊 Tableau de bord'}
                {tab === 'genealogie' && '🌳 Généalogie'}
                {tab === 'personnes' && '👤 Personnes'}
                {tab === 'relations' && '🤝 Relations'}
                {tab === 'souvenirs' && '📜 Souvenirs'}
                {tab === 'membres' && '👥 Équipe'}
                {tab === 'origines' && '⌖ Carte des origines'}
                {tab === 'chefferie' && '⌂ Espace chefferie'}
                {tab === 'assistant' && '✦ Demander à GRIOT'}
                {tab === 'style' && '◐ Charte graphique'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="griot-detail-content">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === 'tableau' && (
          <section className="griot-dashboard" aria-labelledby="dashboard-title">
            <label className="griot-dashboard-search">
              <span className="sr-only">Rechercher dans cet arbre</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={dashboardSearch}
                onChange={(event) => setDashboardSearch(event.target.value)}
                placeholder="Rechercher une personne ou un village…"
              />
            </label>
            {searchResults.length > 0 && (
              <div className="griot-dashboard-search-results" role="list">
                {searchResults.slice(0, 5).map((person) => (
                  <button key={person.id} onClick={() => openPersonProfile(person)} role="listitem">
                    <span className="griot-dashboard-avatar">{person.prenom?.[0]}{person.nom?.[0]}</span>
                    <span>{person.prenom} {person.nom}</span>
                    <small>{person.villageOrigine || 'Ouvrir la fiche'}</small>
                  </button>
                ))}
              </div>
            )}

            <header className="griot-dashboard-welcome">
              <div>
                <p className="griot-eyebrow">VOTRE HISTOIRE CONTINUE</p>
                <h2 id="dashboard-title">Bienvenue chez vous, {user?.prenom || ''}</h2>
                <p>Chaque personne, chaque récit rapproche votre famille de ses racines.</p>
              </div>
              <span className="griot-dashboard-welcome-mark"><TreeMotif size={24} /></span>
            </header>

            {dashboardLoading && <p className="griot-muted">Mise à jour de votre espace…</p>}
            {dashboard && (
              <>
                <div className="griot-dashboard-layout">
                  <div className="griot-dashboard-primary">
                    <button className="griot-tree-summary" onClick={() => setActiveTab('genealogie')}>
                      <span className="griot-tree-summary-motif"><TreeMotif size={112} /></span>
                      <span className="griot-tree-summary-eyebrow">VOTRE ARBRE</span>
                      <strong>{tree.nom}</strong>
                      <span>{dashboard.statistiques.personnes} personne{dashboard.statistiques.personnes === 1 ? '' : 's'} · {dashboard.statistiques.relations} lien{dashboard.statistiques.relations === 1 ? '' : 's'} familial{dashboard.statistiques.relations === 1 ? '' : 'aux'}</span>
                      <span className="griot-tree-summary-link">Voir la généalogie <span aria-hidden="true">→</span></span>
                    </button>

                    <section className="griot-dashboard-missions">
                      <div className="griot-dashboard-section-heading">
                        <div>
                          <p className="griot-eyebrow">VOTRE PROGRESSION</p>
                          <h3>Complétez votre histoire</h3>
                        </div>
                        <span>{dashboard.completude.pourcentage}%</span>
                      </div>
                      <div className="griot-dashboard-progress" role="progressbar" aria-label="Complétude de l’arbre" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dashboard.completude.pourcentage}>
                        <span style={{ width: `${dashboard.completude.pourcentage}%` }} />
                      </div>
                      <p className="griot-dashboard-progress-caption">{dashboard.completude.missionsTerminees} mission{dashboard.completude.missionsTerminees === 1 ? '' : 's'} terminée{dashboard.completude.missionsTerminees === 1 ? '' : 's'} sur {dashboard.completude.totalMissions}</p>
                      <div className="griot-dashboard-mission-list">
                        {dashboard.missions.map((mission) => (
                          <article key={mission.id}>
                            <span className={`griot-mission-mark${mission.terminee ? ' is-done' : ''}`} aria-hidden="true">{mission.terminee ? '✓' : '○'}</span>
                            <div><h4>{mission.libelle}</h4><p>{mission.description}</p></div>
                            <button onClick={() => {
                              setActiveTab(mission.onglet);
                              if (mission.onglet === 'personnes' && mission.id === 'ajouter-personnes') setShowAddPersonForm(true);
                              if (mission.onglet === 'souvenirs') setShowAddSouvenirForm(true);
                            }}>{mission.terminee ? 'Voir' : 'Continuer'}</button>
                          </article>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="griot-dashboard-aside">
                    <section className="griot-dashboard-stat-grid" aria-label="Résumé familial">
                      <article><span>ORIGINES</span><strong>{originLabel || 'À renseigner'}</strong><small>{migrations.length} lieu{migrations.length === 1 ? '' : 'x'} documenté{migrations.length === 1 ? '' : 's'}</small></article>
                      <article><span>COLLABORATION</span><strong>{dashboard.statistiques.membres} membre{dashboard.statistiques.membres === 1 ? '' : 's'}</strong><small>{membres.filter((member) => member.statut !== 'actif').length} invitation{membres.filter((member) => member.statut !== 'actif').length === 1 ? '' : 's'} en attente</small></article>
                      <article><span>MÉMOIRE</span><strong>{dashboard.statistiques.souvenirs} récit{dashboard.statistiques.souvenirs === 1 ? '' : 's'}</strong><small>{dashboard.statistiques.personnes} profil{dashboard.statistiques.personnes === 1 ? '' : 's'} à transmettre</small></article>
                    </section>

                    <section className="griot-dashboard-quick-actions">
                      <div className="griot-dashboard-section-heading"><h3>Faire grandir l’arbre</h3></div>
                      <div>
                        {peutAjouterPersonne && <button onClick={openAddPerson}><span aria-hidden="true">＋</span>Ajouter une personne</button>}
                        {peutAjouterPersonne && <button onClick={openAddSouvenir}><span aria-hidden="true">❝</span>Raconter une histoire</button>}
                        {peutAjouterPersonne && <button onClick={openAddMedia}><span aria-hidden="true">▧</span>Ajouter un document</button>}
                        {peutGererMembres && <button onClick={() => setActiveTab('membres')}><span aria-hidden="true">♧</span>Gérer les rôles</button>}
                      </div>
                    </section>

                    <section className="griot-dashboard-collaborators">
                      <div className="griot-dashboard-section-heading">
                        <div><p className="griot-eyebrow">ESPACE PARTAGÉ</p><h3>Collaborateurs</h3></div>
                        {peutGererMembres && <button onClick={() => { setActiveTab('membres'); setShowAddMemberForm(true); }}>+ Inviter</button>}
                      </div>
                      {membres.length === 0 ? <p className="griot-muted">Aucun membre dans cet arbre.</p> : membres.slice(0, 4).map((member) => (
                        <div className="griot-collaborator-row" key={member.id}>
                          <span className="griot-dashboard-avatar">{member.utilisateur?.prenom?.[0] || member.utilisateur?.email?.[0] || '?'}</span>
                          <span><strong>{member.utilisateur?.prenom} {member.utilisateur?.nom || member.utilisateur?.email}</strong><small>{member.role}</small></span>
                          <small className={member.statut === 'actif' ? 'is-active' : 'is-pending'}>{member.statut === 'actif' ? 'Actif' : 'En attente'}</small>
                        </div>
                      ))}
                      <button className="griot-dashboard-text-link" onClick={() => setActiveTab('membres')}>Voir tous les rôles →</button>
                    </section>
                  </aside>
                </div>

                <section className="griot-dashboard-recent">
                  <div className="griot-dashboard-section-heading">
                    <div><p className="griot-eyebrow">TRANSMISSION</p><h3>Souvenirs récemment partagés</h3></div>
                    <button onClick={() => setActiveTab('souvenirs')}>Toute la mémoire →</button>
                  </div>
                  {recentSouvenirs.length === 0 ? (
                    <div className="griot-dashboard-empty"><p>Les récits de votre famille trouveront leur place ici.</p><button onClick={openAddSouvenir}>Raconter le premier souvenir</button></div>
                  ) : (
                    <div className="griot-dashboard-memory-list">{recentSouvenirs.map((souvenir) => (
                      <article key={souvenir.id}>
                        <span aria-hidden="true">❝</span>
                        <div><small>{souvenir.categorie}{souvenir.dateCreation ? ` · ${new Date(souvenir.dateCreation).toLocaleDateString('fr-FR')}` : ''}</small><h4>{souvenir.titre}</h4><p>{souvenir.contenu || 'Un souvenir conservé dans la mémoire familiale.'}</p></div>
                      </article>
                    ))}</div>
                  )}
                </section>
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
            <div className="griot-list-heading">
              <div>
                <p className="griot-eyebrow">VISAGES & GÉNÉRATIONS</p>
                <h2 className="text-2xl font-bold text-gray-900">Fiches de famille</h2>
                <p>{personnes.length} personne{personnes.length === 1 ? '' : 's'} dans cet arbre</p>
              </div>
              {peutAjouterPersonne && <button
                onClick={() => setShowAddPersonForm(!showAddPersonForm)}
                className="griot-button griot-button-primary"
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
                    className="griot-button griot-button-primary"
                  >
                    Ajouter
                  </button>
                </form>
              </div>
            )}

            {personnes.length === 0 ? (
              <div className="griot-memory-empty">
                <span aria-hidden="true">♧</span>
                <h3>La première branche commence ici</h3>
                <p>Ajoutez une personne pour commencer à relier les générations et transmettre son histoire.</p>
                {peutAjouterPersonne && <button className="griot-button griot-button-primary" onClick={openAddPerson}>Ajouter une personne</button>}
              </div>
            ) : (
              <div className="griot-person-grid">
                {personnes.map((person) => (
                  <article key={person.id} className="griot-person-card">
                    <span className="griot-person-avatar">{person.prenom?.[0]}{person.nom?.[0]}</span>
                    <div className="griot-person-card-copy">
                      <h3>{person.prenom} {person.nom}</h3>
                      <p>{person.villageOrigine || 'Origine à renseigner'}</p>
                      <small>{person.dateNaissance ? new Date(person.dateNaissance).getFullYear() : 'Date inconnue'}{person.dateDeces ? ` – ${new Date(person.dateDeces).getFullYear()}` : ''}</small>
                      {person.biographie && <p className="griot-person-bio">{person.biographie}</p>}
                    </div>
                    <div className="griot-person-card-actions">
                      <button
                        onClick={() => openPersonProfile(person)}
                      >
                        Ouvrir la fiche →
                      </button>
                      {peutGererArbre && <button
                        onClick={() => handleDeletePerson(person.id)}
                        aria-label={`Supprimer ${person.prenom} ${person.nom}`}
                        className="griot-person-delete"
                      >
                        Supprimer
                      </button>}
                    </div>
                  </article>
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
                  <button type="submit" className="griot-button griot-button-primary">
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
          <section className="griot-memory-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <p className="griot-eyebrow">TRANSMISSION FAMILIALE</p>
                <h2 className="text-2xl font-bold text-gray-900">Mémoire familiale</h2>
                <p className="text-sm text-gray-600 mt-1">Histoires et traditions transmises dans la famille.</p>
              </div>
              {peutAjouterPersonne && (
                <button
                  onClick={() => setShowAddSouvenirForm(!showAddSouvenirForm)}
                  className="griot-button griot-button-primary"
                >
                  {showAddSouvenirForm ? 'Annuler' : '+ Raconter un souvenir'}
                </button>
              )}
            </div>

            <div className="griot-memory-tabs" role="tablist" aria-label="Vue de la mémoire familiale">
              {[
                ['histoires', 'Histoires'],
                ['traditions', 'Traditions'],
                ['frise', 'Frise chronologique'],
              ].map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={souvenirView === view}
                  className={souvenirView === view ? 'is-active' : ''}
                  onClick={() => setSouvenirView(view)}
                >
                  {label}
                  {view !== 'frise' && <span>{view === 'traditions' ? souvenirs.filter((souvenir) => souvenir.categorie !== 'histoire').length : souvenirs.length}</span>}
                </button>
              ))}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="souvenir-audio">
                    Enregistrement audio (4 Mio maximum, facultatif)
                  </label>
                  <input
                    id="souvenir-audio"
                    type="file"
                    accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      if (file && file.size > 4 * 1024 * 1024) {
                        setNewSouvenirAudio(null);
                        setError('L’enregistrement audio ne peut pas dépasser 4 Mio.');
                        event.target.value = '';
                        return;
                      }
                      setError('');
                      setNewSouvenirAudio(file);
                    }}
                  />
                  {newSouvenirAudio && <p className="griot-memory-audio-selection">{newSouvenirAudio.name}</p>}
                </div>
                <button
                  type="submit"
                  disabled={savingSouvenir}
                  className="griot-button griot-button-primary"
                >
                  {savingSouvenir ? 'Enregistrement...' : 'Enregistrer le souvenir'}
                </button>
              </form>
            )}

            {displayedSouvenirs.length === 0 ? (
              <div className="griot-memory-empty">
                <span aria-hidden="true">❝</span>
                <h3>{souvenirView === 'traditions' ? 'Aucune tradition enregistrée' : 'La mémoire familiale commence ici'}</h3>
                <p>{souvenirView === 'traditions' ? 'Les recettes, chants, proverbes et coutumes ajoutés apparaîtront dans cette vue.' : 'Conservez une histoire, une recette ou un moment important pour les générations suivantes.'}</p>
                {peutAjouterPersonne && (
                  <button className="griot-button griot-button-primary" onClick={openAddSouvenir}>Ajouter un souvenir</button>
                )}
              </div>
            ) : souvenirView === 'frise' ? (
              <div className="griot-memory-timeline">
                {displayedSouvenirs.map((souvenir) => (
                  <article key={souvenir.id}>
                    <span className="griot-memory-timeline-dot" aria-hidden="true" />
                    <div className="griot-memory-timeline-date">
                      {souvenir.dateCreation ? new Date(souvenir.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date non renseignée'}
                    </div>
                    <div className="griot-memory-timeline-card">
                      <span className="griot-memory-category">{souvenir.categorie}</span>
                      <h3>{souvenir.titre}</h3>
                      <p>{souvenir.contenu || 'Aucun récit détaillé pour le moment.'}</p>
                      <small>{souvenir.personne ? `${souvenir.personne.prenom} ${souvenir.personne.nom}` : 'Mémoire familiale'}</small>
                      <SouvenirInteractions arbreId={treeId} souvenir={souvenir} role={roleCourant} userId={user?.id} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="griot-memory-grid">
                {displayedSouvenirs.map((souvenir) => (
                  <article key={souvenir.id} className="griot-memory-card">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="griot-memory-category">
                          {souvenir.categorie}
                        </span>
                        <h3>{souvenir.titre}</h3>
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
                      <p className="griot-memory-content">{souvenir.contenu}</p>
                    )}
                    <div className="griot-memory-meta">
                      <span>
                        {souvenir.personne
                          ? `${souvenir.personne.prenom} ${souvenir.personne.nom}`
                          : 'Mémoire familiale'}
                        {souvenir.auteur && ` · partagé par ${souvenir.auteur.prenom} ${souvenir.auteur.nom}`}
                      </span>
                      <MemoryVerificationBadge status={souvenir.statutVerification} />
                    </div>
                    <SouvenirInteractions arbreId={treeId} souvenir={souvenir} role={roleCourant} userId={user?.id} />
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MEMBRES TAB */}
        {activeTab === 'membres' && (
          <section className="griot-members-section">
            <div className="griot-members-heading">
              <div>
                <p className="griot-eyebrow">ÉQUIPE FAMILIALE</p>
                <h2>Rôles & permissions</h2>
                <p>Choisissez qui peut voir, proposer, modifier ou valider les informations de cet arbre.</p>
              </div>
              {peutGererMembres && <button
                onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                className="griot-button griot-button-primary"
              >
                {showAddMemberForm ? 'Annuler' : '+ Inviter avec un rôle'}
              </button>}
            </div>

            <div className="griot-role-cards">
              <article><strong>Administrateur</strong><span>Gère les membres et les réglages de l’arbre.</span></article>
              <article><strong>Éditeur</strong><span>Modifie les personnes, relations et contenus.</span></article>
              <article><strong>Contributeur</strong><span>Ajoute des informations et des souvenirs.</span></article>
              <article><strong>Lecteur</strong><span>Consulte les informations auxquelles il a accès.</span></article>
            </div>

            {showAddMemberForm && (
              <section className="griot-members-form-card">
                <form onSubmit={handleAddMember} className="griot-members-form">
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    <span>Rôle</span>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    >
                      <option value="lecteur">Lecteur (lecture seule)</option>
                      <option value="contributeur">Contributeur (ajouter/modifier)</option>
                      <option value="editeur">Éditeur (modifier le contenu)</option>
                      <option value="admin">Administrateur (gérer l’équipe)</option>
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="griot-button griot-button-primary"
                  >
                    Envoyer l’invitation
                  </button>
                </form>
              </section>
            )}

            {membres.length === 0 ? (
              <div className="griot-members-empty">
                <h3>Votre équipe commence ici</h3>
                <p>Invitez vos proches à contribuer à la mémoire familiale.</p>
              </div>
            ) : (
              <div className="griot-members-table-wrap">
                <table className="griot-members-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membres.map((member) => (
                      <tr key={member.id}>
                        <td>{member.utilisateur?.email}</td>
                        <td>
                          {peutGererMembres && member.utilisateurId !== user?.id ? (
                            <select
                              className="griot-role-select"
                              aria-label={`Rôle de ${member.utilisateur?.email || 'ce membre'}`}
                              value={member.role}
                              onChange={(event) => handleUpdateMemberRole(member.id, event.target.value)}
                            >
                              <option value="lecteur">Lecteur</option>
                              <option value="contributeur">Contributeur</option>
                              <option value="editeur">Éditeur</option>
                              <option value="admin">Administrateur</option>
                            </select>
                          ) : member.role}
                        </td>
                        <td>
                          <span
                            className={`griot-member-status${member.statut === 'actif' ? ' is-active' : ' is-pending'}`}
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
          </section>
        )}
        {activeTab === 'origines' && (
          <OriginsPanel
            arbreId={treeId}
            migrations={migrations}
            personnes={personnes}
            role={roleCourant}
            onRefresh={loadTreeData}
          />
        )}
        {activeTab === 'chefferie' && (
          <GovernancePanel
            arbreId={treeId}
            institution={institution}
            preuves={preuves}
            personnes={personnes}
            role={roleCourant}
            onRefresh={loadTreeData}
          />
        )}
        {activeTab === 'assistant' && <AssistantPanel arbreId={treeId} />}
        {activeTab === 'style' && <StylePanel />}
      </main>
      {selectedPerson && personDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="person-profile-title"
            className="griot-profile-dialog bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <header className="griot-profile-header">
              <div className="griot-profile-cover" aria-hidden="true" />
              <div className="griot-profile-heading">
                <span className="griot-profile-avatar">{selectedPerson.prenom?.[0]}{selectedPerson.nom?.[0]}</span>
                <div>
                  <p>PROFIL FAMILIAL</p>
                  <h2 id="person-profile-title">
                    {selectedPerson.prenom} {selectedPerson.nom}
                  </h2>
                  <span>{selectedPerson.dateNaissance ? new Date(selectedPerson.dateNaissance).getFullYear() : 'Date inconnue'}{selectedPerson.dateDeces ? ` – ${new Date(selectedPerson.dateDeces).getFullYear()}` : ''}{selectedPerson.villageOrigine ? ` · ${selectedPerson.villageOrigine}` : ''}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                aria-label="Fermer le profil"
                className="griot-profile-close"
              >
                ×
              </button>
            </header>

            {personError && (
              <p role="alert" className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {personError}
              </p>
            )}

            {!editingPerson && (
              <nav className="griot-profile-tabs" role="tablist" aria-label="Rubriques du profil">
                {[
                  ['bio', 'Biographie'],
                  ['medias', 'Médias'],
                  ['liens', 'Liens'],
                  ['souvenirs', 'Souvenirs'],
                  ['chronologie', 'Frise'],
                ].map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={personProfileTab === tab}
                    className={personProfileTab === tab ? 'is-active' : ''}
                    onClick={() => setPersonProfileTab(tab)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
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
                    className="griot-button griot-button-outline"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingPerson}
                    className="griot-button griot-button-primary"
                  >
                    {savingPerson ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="griot-profile-content">
                {personProfileTab === 'medias' && <section className="griot-profile-section">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-gray-900">Médias privés</h3>
                    {peutAjouterPersonne && (
                      <label className="griot-button griot-button-primary">
                        {uploadingPhoto ? 'Envoi...' : 'Ajouter un fichier'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm,video/mp4,video/webm,application/pdf"
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
                        <article key={photo.id} className="griot-media-item">
                          {photo.type === 'photo' && (
                            <img
                              src={photo.src}
                              alt={`Photo de ${selectedPerson.prenom} ${selectedPerson.nom}`}
                            />
                          )}
                          {photo.type === 'audio' && (
                            <div><p>Enregistrement audio</p><audio controls preload="metadata" src={photo.src}>Votre navigateur ne prend pas en charge la lecture audio.</audio></div>
                          )}
                          {photo.type === 'video' && (
                            <video controls preload="metadata" src={photo.src}>Votre navigateur ne prend pas en charge la lecture vidéo.</video>
                          )}
                          {photo.type === 'document' && (
                            <a href={photo.src} target="_blank" rel="noreferrer">Ouvrir le document PDF ↗</a>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">Aucun média pour le moment.</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Images, audio, vidéo ou PDF · 4 Mio maximum par fichier. Les médias sont visibles uniquement par les membres de l’arbre.
                  </p>
                </section>}
                {personProfileTab === 'bio' && <>
                <dl className="griot-profile-facts">
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
                    <dd><MemoryVerificationBadge status={selectedPerson.statutVerification} /></dd>
                  </div>
                </dl>
                <section>
                  <h3 className="font-semibold text-gray-900">Biographie</h3>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                    {selectedPerson.biographie || 'Aucune biographie enregistrée.'}
                  </p>
                </section>
                </>}
                {personProfileTab === 'liens' && <section className="griot-profile-section">
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
                </section>}
                {personProfileTab === 'souvenirs' && <section className="griot-profile-section">
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
                </section>}
                {personProfileTab === 'chronologie' && (
                  <section className="griot-profile-section">
                    <h3 className="font-semibold text-gray-900">Repères biographiques</h3>
                    <div className="griot-profile-timeline">
                      {[
                        selectedPerson.dateNaissance && {
                          label: 'Naissance',
                          date: selectedPerson.dateNaissance,
                          place: selectedPerson.villageOrigine,
                        },
                        selectedPerson.dateDeces && {
                          label: 'Décès',
                          date: selectedPerson.dateDeces,
                          place: '',
                        },
                      ].filter(Boolean).map((event) => (
                        <article key={event.label}>
                          <span aria-hidden="true" />
                          <div><strong>{new Date(event.date).toLocaleDateString('fr-FR')}</strong><p>{event.label}{event.place ? ` · ${event.place}` : ''}</p></div>
                        </article>
                      ))}
                      {!selectedPerson.dateNaissance && !selectedPerson.dateDeces && <p className="griot-muted">Aucune date biographique n’a été renseignée.</p>}
                    </div>
                  </section>
                )}
                {peutGererArbre && (
                  <div className="griot-profile-edit">
                    <button
                      onClick={() => setEditingPerson(true)}
                      className="griot-button griot-button-primary"
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
