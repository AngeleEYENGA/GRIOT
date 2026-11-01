// API Client pour communiquer avec le backend NestJS
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class GriotAPI {
  constructor() {
    this.token = localStorage.getItem('griot_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('griot_token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('griot_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async requestBlob(endpoint) {
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }
    return response.blob();
  }

  // 🔐 AUTH
  register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  login(email, motDePasse) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    });
  }

  loginWithGoogle(credential) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }

  getProfile() {
    return this.request('/auth/me');
  }

  updateProfile(data) {
    return this.request('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // 🌳 ARBRES (Family Trees)
  createArbre(nom, visibilite = 'prive') {
    return this.request('/arbres', {
      method: 'POST',
      body: JSON.stringify({ nom, visibilite }),
    });
  }

  getArbres() {
    return this.request('/arbres');
  }

  searchPublicTrees(recherche = '') {
    const query = recherche.trim();
    return this.request(`/arbres/publics${query ? `?recherche=${encodeURIComponent(query)}` : ''}`);
  }

  getArbre(arbreId) {
    return this.request(`/arbres/${arbreId}`);
  }

  getTreeDashboard(arbreId) {
    return this.request(`/arbres/${arbreId}/tableau-de-bord`);
  }

  updateArbre(arbreId, data) {
    return this.request(`/arbres/${arbreId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteArbre(arbreId) {
    return this.request(`/arbres/${arbreId}`, {
      method: 'DELETE',
    });
  }

  // 👤 PERSONNES (Individuals)
  createPersonne(arbreId, data) {
    return this.request(`/arbres/${arbreId}/personnes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getPersonnes(arbreId) {
    return this.request(`/arbres/${arbreId}/personnes`);
  }

  getPersonne(arbreId, personneId) {
    return this.request(`/arbres/${arbreId}/personnes/${personneId}`);
  }

  updatePersonne(arbreId, personneId, data) {
    return this.request(`/arbres/${arbreId}/personnes/${personneId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deletePersonne(arbreId, personneId) {
    return this.request(`/arbres/${arbreId}/personnes/${personneId}`, {
      method: 'DELETE',
    });
  }

  getPersonPhotos(arbreId, personneId) {
    return this.request(`/arbres/${arbreId}/personnes/${personneId}/photos`);
  }

  getPersonMedias(arbreId, personneId) {
    return this.request(`/arbres/${arbreId}/personnes/${personneId}/medias`);
  }

  uploadPersonPhoto(arbreId, personneId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/arbres/${arbreId}/personnes/${personneId}/photos`, {
      method: 'POST',
      body: formData,
    });
  }

  uploadPersonMedia(arbreId, personneId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/arbres/${arbreId}/personnes/${personneId}/medias`, {
      method: 'POST',
      body: formData,
    });
  }

  getPersonPhotoBlob(arbreId, mediaId) {
    return this.requestBlob(`/arbres/${arbreId}/medias/${mediaId}/contenu`);
  }

  getPersonMediaBlob(arbreId, mediaId) {
    return this.requestBlob(`/arbres/${arbreId}/medias/${mediaId}/contenu`);
  }

  // 🤝 RELATIONS FAMILIALES (Family Links)
  createRelation(arbreId, data) {
    return this.request(`/arbres/${arbreId}/relations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getRelations(arbreId) {
    return this.request(`/arbres/${arbreId}/relations`);
  }

  updateRelation(arbreId, relationId, data) {
    return this.request(`/arbres/${arbreId}/relations/${relationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  deleteRelation(arbreId, relationId) {
    return this.request(`/arbres/${arbreId}/relations/${relationId}`, {
      method: 'DELETE',
    });
  }

  // 👥 MEMBRES (Team Members)
  inviteMembers(arbreId, email, role = 'lecteur') {
    return this.request(`/arbres/${arbreId}/membres`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  getMembers(arbreId) {
    return this.request(`/arbres/${arbreId}/membres`);
  }

  getMigrations(arbreId) {
    return this.request(`/arbres/${arbreId}/migrations`);
  }

  createMigration(arbreId, data) {
    return this.request(`/arbres/${arbreId}/migrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  deleteMigration(arbreId, migrationId) {
    return this.request(`/arbres/${arbreId}/migrations/${migrationId}`, {
      method: 'DELETE',
    });
  }

  getInstitution(arbreId) {
    return this.request(`/arbres/${arbreId}/institution`);
  }

  createInstitution(arbreId, data) {
    return this.request(`/arbres/${arbreId}/institution`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getProofs(arbreId) {
    return this.request(`/arbres/${arbreId}/preuves`);
  }

  createProof(arbreId, data) {
    return this.request(`/arbres/${arbreId}/preuves`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateProof(arbreId, proofId, statutValidation) {
    return this.request(`/arbres/${arbreId}/preuves/${proofId}`, {
      method: 'PATCH',
      body: JSON.stringify({ statutValidation }),
    });
  }

  updateMemberRole(arbreId, membreId, role) {
    return this.request(`/arbres/${arbreId}/membres/${membreId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  acceptMemberInvite(arbreId, membreId) {
    return this.request(`/arbres/${arbreId}/membres/${membreId}/accepter`, {
      method: 'POST',
    });
  }

  // 🎤 SOUVENIRS (Memories)
  createSouvenir(arbreId, data) {
    return this.request(`/arbres/${arbreId}/souvenirs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getSouvenirs(arbreId) {
    return this.request(`/arbres/${arbreId}/souvenirs`);
  }

  deleteSouvenir(arbreId, souvenirId) {
    return this.request(`/arbres/${arbreId}/souvenirs/${souvenirId}`, {
      method: 'DELETE',
    });
  }

  // 🤖 AI
  askAI(question, arbreId) {
    return this.request('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ query: question, arbreId }),
    });
  }
}

export default new GriotAPI();
