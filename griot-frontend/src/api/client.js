// API Client pour communiquer avec le backend NestJS
import { readOffline, writeOffline, clearOffline, offlineEvent, remapLocalIds } from '../utils/offlineStore';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class GriotAPI {
  constructor() {
    this.token = localStorage.getItem('griot_token');
    this.offlineUser = localStorage.getItem('griot-offline-user');
    this.queueLock = Promise.resolve();
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('griot_token', token);
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    const scope = this.offlineUser;
    if (scope) {
      localStorage.removeItem(`griot-offline-enabled:${scope}`);
      localStorage.removeItem(`griot-offline-prepared:${scope}`);
      clearOffline(scope).catch(() => {});
    }
    localStorage.removeItem('griot-offline-user');
    this.offlineUser = null;
    this.token = null;
    localStorage.removeItem('griot_token');
  }

  async request(endpoint, options = {}, { allowEmptyResponse = false, skipOfflineQueue = false, requireNetwork = false, expectedUserId } = {}) {
    const method = options.method || 'GET';
    if (!navigator.onLine) {
      if (requireNetwork) throw new Error('Une connexion réelle est nécessaire pour cette opération.');
      if (method === 'GET') return this.cachedResponse(endpoint);
      if (skipOfflineQueue) throw new Error('Connexion interrompue pendant l’envoi.');
      return this.queueDraft(endpoint, options);
    }
    const url = `${API_URL}${endpoint}`;
    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    let response;
    try { response = await fetch(url, { ...options, headers }); }
    catch {
      if (method === 'GET' && !requireNetwork) return this.cachedResponse(endpoint);
      throw new Error('Connexion interrompue. Vérifiez si l’ajout a été enregistré avant de réessayer.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const failure = new Error(error.message || `API Error: ${response.status}`);
      failure.status = response.status;
      throw failure;
    }

    const responseBody = await response.text();
    const data = !responseBody.trim() && allowEmptyResponse ? null : JSON.parse(responseBody);
    const identity = endpoint === '/auth/me' ? data?.id : /^\/auth\/(login|register|google)$/.test(endpoint) ? data?.utilisateur?.id : null;
    if (expectedUserId && identity !== expectedUserId) throw new Error('Choisissez le compte qui a préparé ces arbres. Les brouillons ont été conservés.');
    if (identity) {
      if (this.offlineUser && this.offlineUser !== identity) {
        localStorage.removeItem(`griot-offline-enabled:${this.offlineUser}`);
        await clearOffline(this.offlineUser).catch(() => {});
      }
      this.offlineUser = identity;
      localStorage.setItem('griot-offline-user', identity);
    }
    if (method === 'GET' && this.offlineEnabled()) {
      await writeOffline(`${this.offlineUser}:cache:${endpoint}`, { data, savedAt: new Date().toISOString() }).catch(() => {});
    }
    return data;
  }

  offlineEnabled() { return Boolean(this.offlineUser && localStorage.getItem(`griot-offline-enabled:${this.offlineUser}`) === '1'); }
  async renewOfflineSession({ email, motDePasse, credential }) {
    const response = await this.request(credential ? '/auth/google' : '/auth/login', { method: 'POST', body: JSON.stringify(credential ? { credential } : { email, motDePasse }) }, { requireNetwork: true, expectedUserId: this.offlineUser });
    this.setToken(response.accessToken);
    return this.request('/auth/me', {}, { requireNetwork: true });
  }
  async cachedResponse(endpoint) {
    if (this.offlineEnabled()) {
      const cached = await readOffline(`${this.offlineUser}:cache:${endpoint}`);
      if (cached) { this.lastCachedAt = cached.savedAt; offlineEvent(); return cached.data; }
    }
    throw new Error('Cette page n’est pas disponible hors ligne. Préparez vos arbres depuis « Mode hors ligne » avec une connexion.');
  }
  async queueDraft(endpoint, options) {
    if (!this.offlineEnabled() || options.method !== 'POST' || !/^\/arbres\/[^/]+\/(personnes|souvenirs|migrations|relations)$/.test(endpoint)) {
      throw new Error('Cette action nécessite une connexion. Hors ligne, seuls les ajouts de personnes, souvenirs, lieux et liens peuvent être conservés comme brouillons.');
    }
    const task = this.queueLock.then(async () => {
      const snapshot = await readOffline(`${this.offlineUser}:cache:${endpoint}`);
      if (!snapshot || !Array.isArray(snapshot.data)) throw new Error('Préparez cet arbre en ligne avant d’y ajouter un brouillon.');
      const body = JSON.parse(options.body);
      const id = `local-${crypto.randomUUID()}`;
      const dateCreation = new Date().toISOString();
      const result = { ...body, id, dateCreation, _offline: true };
      if (endpoint.endsWith('/migrations')) {
        const people = await readOffline(`${this.offlineUser}:cache:${endpoint.replace(/migrations$/, 'personnes')}`);
        result.personne = people?.data.find((person) => person.id === body.personneId);
        result.lieu = { nom: body.lieu, pays: body.pays || '', latitude: body.latitude ?? null, longitude: body.longitude ?? null };
      }
      const queue = await this.pendingDrafts();
      await writeOffline(`${this.offlineUser}:queue`, [...queue, { id, endpoint, body, dateCreation }]);
      await writeOffline(`${this.offlineUser}:cache:${endpoint}`, { data: [...snapshot.data, result], savedAt: snapshot.savedAt });
      offlineEvent();
      return result;
    });
    this.queueLock = task.catch(() => {});
    return task;
  }
  async pendingDrafts() { return this.offlineUser ? (await readOffline(`${this.offlineUser}:queue`)) || [] : []; }
  async prepareOffline() {
    if (!navigator.onLine) throw new Error('Une connexion est nécessaire pour préparer vos arbres.');
    if (import.meta.env.PROD) {
      if (!('serviceWorker' in navigator)) throw new Error('Ce navigateur ne permet pas la préparation de l’interface hors ligne.');
      const registration = await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('L’interface hors ligne n’est pas prête. Rechargez la page en ligne puis réessayez.')), 20000))]);
      const cacheName = await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        const timer = setTimeout(() => { channel.port1.close(); reject(new Error('La nouvelle interface hors ligne doit terminer sa mise à jour. Rechargez la page en ligne puis réessayez.')); }, 5000);
        channel.port1.onmessage = ({ data }) => { clearTimeout(timer); channel.port1.close(); if (data.ready && /^griot-shell-/.test(data.version)) resolve(data.version); else reject(new Error('Interface hors ligne indisponible.')); };
        (navigator.serviceWorker.controller || registration.active).postMessage({ type: 'GRIOT_OFFLINE_READY' }, [channel.port2]);
      });
      // The worker itself may be unchanged between releases: refresh lazy chunks too.
      const manifestResponse = await fetch('/offline-assets.json', { cache: 'reload' });
      if (!manifestResponse.ok) throw new Error('Le manifeste de cette version est indisponible.');
      const assets = await manifestResponse.json();
      if (!Array.isArray(assets) || !assets.every((path) => typeof path === 'string' && /^\/assets\/[^/]+\.(js|css)$/.test(path))) throw new Error('Le manifeste hors ligne est invalide.');
      const shellCache = await caches.open(cacheName);
      for (const path of assets) if (!await caches.match(path, { ignoreVary: true })) await shellCache.add(path);
      const shell = await fetch('/', { cache: 'reload' });
      if (!shell.ok) throw new Error('Impossible de préparer cette version de l’interface.');
      await shellCache.put('/index.html', shell.clone());
      await shellCache.put('/', shell);
    }
    const profile = await this.request('/auth/me', {}, { requireNetwork: true });
    localStorage.setItem(`griot-offline-enabled:${profile.id}`, '1');
    await writeOffline(`${profile.id}:cache:/auth/me`, { data: profile, savedAt: new Date().toISOString() });
    if ((await this.pendingDrafts()).length) throw new Error('Envoyez vos brouillons avant de rafraîchir la copie locale.');
    const trees = await this.request('/arbres', {}, { requireNetwork: true });
    for (const tree of trees) {
      for (const suffix of ['', '/personnes', '/relations', '/membres', '/souvenirs', '/migrations', '/preuves', '/institution', '/tableau-de-bord', '/culture/cartes', '/culture/publications']) {
        await this.request(`/arbres/${tree.id}${suffix}`, {}, { allowEmptyResponse: true, requireNetwork: true });
      }
    }
    for (const path of ['/data/cities.json', '/data/world.geojson']) {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Le catalogue ou le fond cartographique n’a pas pu être téléchargé.');
      if ('caches' in window) { const cache = await caches.open('griot-geography-v1'); await cache.put(path, response); }
    }
    localStorage.setItem(`griot-offline-prepared:${profile.id}`, new Date().toISOString());
    this.lastCachedAt = null;
    offlineEvent();
    return trees.length;
  }
  async syncDrafts() {
    if (!navigator.onLine) throw new Error('Reconnectez-vous pour envoyer les brouillons.');
    if (this.syncing) return;
    this.syncing = true;
    const scope = this.offlineUser;
    const session = this.token;
    const checkSession = () => { if (this.offlineUser !== scope || this.token !== session) throw new Error('La session a changé. L’envoi des brouillons a été arrêté.'); };
    try {
      // Revalidate the session with the server before publishing any local draft.
      await this.request('/auth/me', {}, { requireNetwork: true });
      checkSession();
      const mapping = (await readOffline(`${scope}:mapping`)) || {};
      let queue = await this.pendingDrafts();
      for (const item of [...queue]) {
        checkSession();
        if (item.uncertain) throw new Error('Un envoi a été interrompu. Vérifiez l’arbre en ligne avant de retenter ce brouillon.');
        try {
          const saved = await this.request(item.endpoint, { method: 'POST', body: JSON.stringify(remapLocalIds(item.body, mapping)) }, { skipOfflineQueue: true });
          checkSession();
          if (!saved?.id) throw new Error('Réponse serveur non confirmée.');
          mapping[item.id] = saved.id;
          await writeOffline(`${scope}:mapping`, mapping);
          queue = queue.filter((entry) => entry.id !== item.id);
          await writeOffline(`${scope}:queue`, queue);
          offlineEvent();
        } catch (error) {
          checkSession();
          if (!error.status) {
            queue = queue.map((entry) => entry.id === item.id ? { ...entry, uncertain: true } : entry);
            await writeOffline(`${scope}:queue`, queue);
          }
          throw error;
        }
      }
      await this.prepareOffline();
    } finally { this.syncing = false; offlineEvent(); }
  }
  async removeOffline() {
    if (this.offlineUser) {
      localStorage.removeItem(`griot-offline-enabled:${this.offlineUser}`);
      localStorage.removeItem(`griot-offline-prepared:${this.offlineUser}`);
      await clearOffline(this.offlineUser);
    }
    offlineEvent();
  }
  async exportDrafts() {
    return { format: 'griot-offline-drafts-v1', exportedAt: new Date().toISOString(), drafts: await this.pendingDrafts() };
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

  changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
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

  getCulturePosts(tree, query = {}) { const params = new URLSearchParams(query).toString(); return this.request(`/arbres/${tree}/culture/publications${params ? `?${params}` : ''}`); }
  createCulturePost(tree, data) { return this.request(`/arbres/${tree}/culture/publications`, { method: 'POST', body: JSON.stringify(data) }); }
  deleteCulturePost(tree, id) { return this.request(`/arbres/${tree}/culture/publications/${id}`, { method: 'DELETE' }); }
  getLanguageCards(tree) { return this.request(`/arbres/${tree}/culture/cartes`); }
  createLanguageCard(tree, data) { return this.request(`/arbres/${tree}/culture/cartes`, { method: 'POST', body: JSON.stringify(data) }); }
  validateLanguageCard(tree, id, validee) { return this.request(`/arbres/${tree}/culture/cartes/${id}/validation`, { method: 'PATCH', body: JSON.stringify({ validee }) }); }
  deleteLanguageCard(tree, id) { return this.request(`/arbres/${tree}/culture/cartes/${id}`, { method: 'DELETE' }); }
  uploadLanguageAudio(tree, id, file) { const body = new FormData(); body.append('file', file); return this.request(`/arbres/${tree}/culture/cartes/${id}/audio`, { method: 'POST', body }); }
  getLanguageAudio(tree, id) { return this.requestBlob(`/arbres/${tree}/culture/cartes/${id}/audio`); }

  createMigration(arbreId, data) {
    return this.request(`/arbres/${arbreId}/migrations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateMigration(arbreId, migrationId, data) {
    return this.request(`/arbres/${arbreId}/migrations/${migrationId}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  deleteMigration(arbreId, migrationId) {
    return this.request(`/arbres/${arbreId}/migrations/${migrationId}`, {
      method: 'DELETE',
    });
  }

  getInstitution(arbreId) {
    return this.request(`/arbres/${arbreId}/institution`, {}, { allowEmptyResponse: true });
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

  getNotifications() {
    return this.request('/notifications');
  }

  markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/lue`, { method: 'PATCH' });
  }

  getInstitutionSpace() {
    return this.request('/institutions/espace');
  }

  acceptInstitutionInvite(institutionId, membreId) {
    return this.request(`/institutions/${institutionId}/membres/${membreId}/accepter`, {
      method: 'POST',
    });
  }

  reviewInstitutionProof(institutionId, proofId, statutValidation) {
    return this.request(`/institutions/${institutionId}/preuves/${proofId}`, {
      method: 'PATCH',
      body: JSON.stringify({ statutValidation }),
    });
  }

  inviteInstitutionMember(arbreId, email, role = 'lecteur') {
    return this.request(`/arbres/${arbreId}/institution/membres`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
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

  getSouvenirComments(arbreId, souvenirId) {
    return this.request(`/arbres/${arbreId}/souvenirs/${souvenirId}/commentaires`);
  }

  createSouvenirComment(arbreId, souvenirId, contenu) {
    return this.request(`/arbres/${arbreId}/souvenirs/${souvenirId}/commentaires`, {
      method: 'POST',
      body: JSON.stringify({ contenu }),
    });
  }

  deleteSouvenirComment(arbreId, souvenirId, commentId) {
    return this.request(`/arbres/${arbreId}/souvenirs/${souvenirId}/commentaires/${commentId}`, {
      method: 'DELETE',
    });
  }

  uploadSouvenirMedia(arbreId, souvenirId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/arbres/${arbreId}/souvenirs/${souvenirId}/medias`, {
      method: 'POST',
      body: formData,
    });
  }

  getSouvenirMediaBlob(arbreId, mediaId) {
    return this.requestBlob(`/arbres/${arbreId}/medias/${mediaId}/contenu`);
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
