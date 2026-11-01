/**
 * GRIOT API Integration Module
 * 
 * Patterns et utilities pour connecter le frontend au backend NestJS
 * Utilisable dans griot-app.html et futures apps React
 * 
 * Configuration:
 * const api = new GriotAPI('http://localhost:3001');
 * 
 * Usage:
 * await api.auth.login(email, password);
 * const trees = await api.trees.list();
 * await api.persons.create(treeId, personData);
 */

class GriotAPI {
  constructor(baseUrl = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('griot_token');
    this.userId = localStorage.getItem('griot_user_id');
    
    // Bind namespace methods
    this.auth = this.createAuthAPI();
    this.trees = this.createTreesAPI();
    this.persons = this.createPersonsAPI();
    this.memories = this.createMemoriesAPI();
    this.collaborators = this.createCollaboratorsAPI();
  }

  /* ======================== CORE METHODS ======================== */
  
  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (this.token && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expiré ou invalide
        this.logout();
        throw new Error('Session expirée');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint, options) {
    return this.request('GET', endpoint, null, options);
  }

  post(endpoint, data, options) {
    return this.request('POST', endpoint, data, options);
  }

  patch(endpoint, data, options) {
    return this.request('PATCH', endpoint, data, options);
  }

  delete(endpoint, options) {
    return this.request('DELETE', endpoint, null, options);
  }

  /* ======================== AUTH API ======================== */
  
  createAuthAPI() {
    return {
      /**
       * Inscription utilisateur
       * @param {string} email
       * @param {string} password
       * @param {string} prenom
       * @param {string} nom
       * @param {string} telephone - optionnel
       */
      register: async (email, password, prenom, nom, telephone = null) => {
        const data = await this.post('/auth/register', {
          email,
          password,
          prenom,
          nom,
          telephone,
        }, { skipAuth: true });

        if (data.access_token) {
          this.setToken(data.access_token, data.user.id);
        }
        return data;
      },

      /**
       * Connexion utilisateur
       */
      login: async (email, password) => {
        const data = await this.post('/auth/login', { email, password }, { skipAuth: true });
        
        if (data.access_token) {
          this.setToken(data.access_token, data.user.id);
        }
        return data;
      },

      /**
       * Récupérer le profil actuel
       */
      me: async () => {
        return this.get('/auth/me');
      },

      /**
       * Mettre à jour le profil
       */
      updateProfile: async (data) => {
        return this.patch('/auth/me', data);
      },

      /**
       * Changer le mot de passe
       */
      changePassword: async (currentPassword, newPassword) => {
        return this.patch('/auth/change-password', {
          currentPassword,
          newPassword,
        });
      },

      /**
       * Demander réinitialisation mot de passe
       */
      forgotPassword: async (email) => {
        return this.post('/auth/forgot-password', { email }, { skipAuth: true });
      },

      /**
       * Réinitialiser mot de passe
       */
      resetPassword: async (token, newPassword) => {
        return this.post(`/auth/reset-password`, { token, newPassword }, { skipAuth: true });
      },

      logout: () => {
        this.logout();
      },
    };
  }

  /* ======================== TREES API ======================== */
  
  createTreesAPI() {
    return {
      /**
       * Créer un nouvel arbre généalogique
       */
      create: async (nom, visibilite = 'prive') => {
        return this.post('/arbres', { nom, visibilite });
      },

      /**
       * Récupérer tous les arbres de l'utilisateur
       */
      list: async () => {
        return this.get('/arbres');
      },

      /**
       * Récupérer un arbre spécifique
       */
      get: async (treeId) => {
        return this.get(`/arbres/${treeId}`);
      },

      /**
       * Mettre à jour un arbre
       */
      update: async (treeId, data) => {
        return this.patch(`/arbres/${treeId}`, data);
      },

      /**
       * Supprimer un arbre
       */
      delete: async (treeId) => {
        return this.delete(`/arbres/${treeId}`);
      },

      /**
       * Récupérer les stats d'un arbre
       */
      getStats: async (treeId) => {
        return this.get(`/arbres/${treeId}/stats`);
      },
    };
  }

  /* ======================== PERSONS API ======================== */
  
  createPersonsAPI() {
    return {
      /**
       * Ajouter une nouvelle personne
       */
      create: async (treeId, data) => {
        return this.post('/personnes', {
          ...data,
          arbreId: treeId,
        });
      },

      /**
       * Récupérer les personnes d'un arbre
       */
      list: async (treeId, filters = {}) => {
        const query = new URLSearchParams({ arbreId: treeId, ...filters }).toString();
        return this.get(`/personnes?${query}`);
      },

      /**
       * Récupérer une personne
       */
      get: async (personneId) => {
        return this.get(`/personnes/${personneId}`);
      },

      /**
       * Mettre à jour une personne
       */
      update: async (personneId, data) => {
        return this.patch(`/personnes/${personneId}`, data);
      },

      /**
       * Supprimer une personne
       */
      delete: async (personneId) => {
        return this.delete(`/personnes/${personneId}`);
      },

      /**
       * Rechercher des personnes
       */
      search: async (query) => {
        return this.get(`/personnes/search?q=${encodeURIComponent(query)}`);
      },
    };
  }

  /* ======================== MEMORIES API ======================== */
  
  createMemoriesAPI() {
    return {
      /**
       * Ajouter un souvenir (histoire, tradition, etc.)
       */
      create: async (treeId, data) => {
        return this.post('/souvenirs', {
          ...data,
          arbreId: treeId,
        });
      },

      /**
       * Récupérer les souvenirs d'un arbre
       */
      list: async (treeId, categoria = null) => {
        const query = new URLSearchParams({ arbreId: treeId });
        if (categoria) query.append('categorie', categoria);
        return this.get(`/souvenirs?${query}`);
      },

      /**
       * Récupérer un souvenir
       */
      get: async (souvenirId) => {
        return this.get(`/souvenirs/${souvenirId}`);
      },

      /**
       * Mettre à jour un souvenir
       */
      update: async (souvenirId, data) => {
        return this.patch(`/souvenirs/${souvenirId}`, data);
      },

      /**
       * Supprimer un souvenir
       */
      delete: async (souvenirId) => {
        return this.delete(`/souvenirs/${souvenirId}`);
      },

      /**
       * Upload un média pour un souvenir
       */
      uploadMedia: async (souvenirId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseUrl}/souvenirs/${souvenirId}/media`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        return response.json();
      },
    };
  }

  /* ======================== COLLABORATORS API ======================== */
  
  createCollaboratorsAPI() {
    return {
      /**
       * Inviter un collaborateur
       */
      invite: async (treeId, email, role = 'lecteur') => {
        return this.post('/membres-arbre/invite', {
          arbreId: treeId,
          email,
          role,
        });
      },

      /**
       * Lister les collaborateurs d'un arbre
       */
      list: async (treeId) => {
        return this.get(`/membres-arbre?arbreId=${treeId}`);
      },

      /**
       * Mettre à jour le rôle d'un collaborateur
       */
      updateRole: async (memberId, role) => {
        return this.patch(`/membres-arbre/${memberId}`, { role });
      },

      /**
       * Retirer un collaborateur
       */
      remove: async (memberId) => {
        return this.delete(`/membres-arbre/${memberId}`);
      },

      /**
       * Accepter une invitation
       */
      acceptInvite: async (arbreId) => {
        return this.patch(`/membres-arbre/accept/${arbreId}`, {});
      },

      /**
       * Refuser une invitation
       */
      declineInvite: async (arbreId) => {
        return this.delete(`/membres-arbre/decline/${arbreId}`);
      },
    };
  }

  /* ======================== HELPER METHODS ======================== */
  
  setToken(token, userId) {
    this.token = token;
    this.userId = userId;
    localStorage.setItem('griot_token', token);
    localStorage.setItem('griot_user_id', userId);
  }

  logout() {
    this.token = null;
    this.userId = null;
    localStorage.removeItem('griot_token');
    localStorage.removeItem('griot_user_id');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

/* ======================== STORAGE HELPERS ======================== */

class GriotStorage {
  /**
   * Cache local pour fonctionnement hors ligne
   */
  static setCache(key, data, ttl = 3600000) { // 1h par défaut
    const cache = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`griot_cache_${key}`, JSON.stringify(cache));
  }

  static getCache(key) {
    const cache = localStorage.getItem(`griot_cache_${key}`);
    if (!cache) return null;

    const { data, timestamp, ttl } = JSON.parse(cache);
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(`griot_cache_${key}`);
      return null;
    }

    return data;
  }

  /**
   * Queue pour synchronisation hors ligne
   */
  static queueAction(action, endpoint, data) {
    const queue = JSON.parse(localStorage.getItem('griot_sync_queue') || '[]');
    queue.push({
      id: `${Date.now()}_${Math.random()}`,
      action,
      endpoint,
      data,
      timestamp: Date.now(),
    });
    localStorage.setItem('griot_sync_queue', JSON.stringify(queue));
  }

  static getSyncQueue() {
    return JSON.parse(localStorage.getItem('griot_sync_queue') || '[]');
  }

  static clearSyncQueue() {
    localStorage.removeItem('griot_sync_queue');
  }
}

/* ======================== REACT HOOKS ======================== */

/**
 * Hook React pour utiliser l'API GRIOT
 * 
 * const { data, loading, error } = useGriotAPI(async () => {
 *   return api.trees.list();
 * });
 */
function useGriotAPI(asyncFn, dependencies = []) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFn();
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

// Export pour usage global
if (typeof window !== 'undefined') {
  window.GriotAPI = GriotAPI;
  window.GriotStorage = GriotStorage;
  if (typeof React !== 'undefined') {
    window.useGriotAPI = useGriotAPI;
  }
}
