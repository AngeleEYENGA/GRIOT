/**
 * GRIOT — Intégration API Backend
 * 
 * Exemple d'utilisation du module GriotAPI dans griot-app.html
 * 
 * Étapes:
 * 1. Inclure griot-api.js avant le code principal
 * 2. Initialiser l'API: const api = new GriotAPI();
 * 3. Utiliser les méthodes: await api.auth.login(email, password);
 * 4. Gérer l'authentification avec localStorage
 */

// ==================== EXEMPLE D'INTÉGRATION ====================

// Dans le <head> ou avant le script principal:
// <script src="griot-api.js"></script>

// Initialiser l'API
const api = new GriotAPI('http://localhost:3001/api');

// ==================== COMPOSANTS AVEC API ====================

/**
 * EXEMPLE 1: Écran de connexion avec API
 */
function LoginModalWithAPI({ onSuccess, onClose }) {
  const { useState } = React;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.login(email, password);
      console.log('Connexion réussie:', result);
      setError('');
      onSuccess?.(result);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Connexion</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div style={{
            background: 'rgba(200, 68, 50, 0.1)',
            color: 'var(--error)',
            padding: '12px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email</label>
          <input
            className="input-field"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Mot de passe</label>
          <input
            className="input-field"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginBottom: 12 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
          Pas de compte? {' '}
          <a href="#" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * EXEMPLE 2: Dashboard qui charge les données de l'API
 */
function DashboardWithAPI() {
  const { useState, useEffect } = React;
  const [user, setUser] = useState(null);
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger le profil utilisateur
      if (api.isAuthenticated()) {
        const userData = await api.auth.me();
        setUser(userData);
        
        // Charger les arbres de l'utilisateur
        const treesList = await api.trees.list();
        setTrees(treesList);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!api.isAuthenticated()) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Veuillez vous connecter</div>;
  }

  return (
    <div className="content-inner">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          Bienvenue, {user?.prenom}
        </h1>
        <p style={{ color: 'var(--ink-soft)' }}>
          Gérez votre arbre généalogique et sa mémoire familiale
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(200, 68, 50, 0.1)',
          color: 'var(--error)',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        }}>
          Erreur: {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Chargement...</div>
      ) : (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-header">🌳 Mes arbres généalogiques</h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>
              Vous avez {trees.length} arbre{trees.length > 1 ? 's' : ''}
            </p>
            
            {trees.length === 0 ? (
              <button className="btn btn-primary btn-sm">
                + Créer un nouvel arbre
              </button>
            ) : (
              <div>
                {trees.map(tree => (
                  <div key={tree.id} style={{ 
                    padding: '12px 0', 
                    borderBottom: '1px solid var(--line)', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{tree.nom}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                        Créé le {new Date(tree.dateCreation).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Ouvrir</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="card-header">👤 Mon profil</h3>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.8 }}>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Téléphone:</strong> {user?.telephone || 'Non fourni'}</div>
              <div><strong>Langue:</strong> {user?.langue}</div>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm">Modifier le profil</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EXEMPLE 3: Formulaire d'ajout de personne avec API
 */
function AddPersonWithAPI({ treeId, onSuccess, onClose }) {
  const { useState } = React;
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    anneeNaissance: '',
    anneeDecès: '',
    lieu: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.nom || !formData.prenom) {
      setError('Prénom et nom requis');
      return;
    }

    setLoading(true);
    try {
      const result = await api.persons.create(treeId, {
        nom: formData.nom,
        prenom: formData.prenom,
        dateNaissance: formData.anneeNaissance ? parseInt(formData.anneeNaissance) : null,
        dateDecès: formData.anneeDecès ? parseInt(formData.anneeDecès) : null,
        lieuOrigine: formData.lieu,
      });

      console.log('Personne ajoutée:', result);
      setError('');
      onSuccess?.(result);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>➕ Ajouter une personne</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(200, 68, 50, 0.1)',
            color: 'var(--error)',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Prénom</label>
          <input
            className="input-field"
            placeholder="Jean"
            value={formData.prenom}
            onChange={(e) => handleChange('prenom', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Nom</label>
          <input
            className="input-field"
            placeholder="Mvondo"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Naissance</label>
            <input
              className="input-field"
              type="number"
              placeholder="1920"
              value={formData.anneeNaissance}
              onChange={(e) => handleChange('anneeNaissance', e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Décès</label>
            <input
              className="input-field"
              type="number"
              placeholder="2000"
              value={formData.anneeDecès}
              onChange={(e) => handleChange('anneeDecès', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Lieu d'origine</label>
          <input
            className="input-field"
            placeholder="Nkolbisson, Cameroun"
            value={formData.lieu}
            onChange={(e) => handleChange('lieu', e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          style={{ marginBottom: 12 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter'}
        </button>

        <button
          className="btn btn-secondary btn-block"
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

/**
 * EXEMPLE 4: Hook React pour charger les données
 */
function TreeDetailWithAPI({ treeId }) {
  const { useState, useEffect } = React;
  const [tree, setTree] = useState(null);
  const [persons, setPersons] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreeData();
  }, [treeId]);

  const loadTreeData = async () => {
    try {
      const treeData = await api.trees.get(treeId);
      setTree(treeData);

      const personsList = await api.persons.list(treeId);
      setPersons(personsList);

      const memoriesList = await api.memories.list(treeId);
      setMemories(memoriesList);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="content-inner">
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, marginBottom: 24 }}>
        {tree?.nom}
      </h1>
      <div className="grid-2">
        <div className="card">
          <h3 className="card-header">👥 Personnes</h3>
          <p>Total: {persons.length}</p>
        </div>
        <div className="card">
          <h3 className="card-header">📚 Souvenirs</h3>
          <p>Total: {memories.length}</p>
        </div>
      </div>
    </div>
  );
}

// ==================== UTILISATION ====================

/*
// Dans votre composant principal:
function App() {
  const [currentScreen, setCurrentScreen] = useState('accueil');
  const [isLoggedIn, setIsLoggedIn] = useState(api.isAuthenticated());
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setCurrentScreen('dashboard');
  };

  if (!isLoggedIn) {
    return showLoginModal && (
      <LoginModalWithAPI
        onSuccess={handleLoginSuccess}
        onClose={() => {}}
      />
    );
  }

  return (
    <div>
      {currentScreen === 'dashboard' && <DashboardWithAPI />}
      {currentScreen === 'tree' && <TreeDetailWithAPI treeId="tree-123" />}
      {/* ... autres écrans ... */}
    </div>
  );
}
*/
