import React, { useState, useEffect } from 'react';
import api from '../api/client';
import AuthContext from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (api.getToken()) {
        const profile = await api.getProfile();
        setUser(profile);
      }
    } catch (error) {
      if ([401, 403].includes(error.status) && api.offlineEnabled()) {
        try { setUser(await api.cachedResponse('/auth/me')); }
        catch { api.clearToken(); setUser(null); }
      } else { if ([401, 403].includes(error.status)) api.clearToken(); setUser(null); }
    } finally {
      setLoading(false);
    }
  };

  const register = async (nom, prenom, email, motDePasse, telephone = '') => {
    setError(null);
    try {
      const response = await api.register({
        nom,
        prenom,
        email,
        motDePasse,
        telephone,
      });
      api.setToken(response.accessToken);
      setUser(response.utilisateur);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, motDePasse) => {
    setError(null);
    try {
      const response = await api.login(email, motDePasse);
      api.setToken(response.accessToken);
      setUser(response.utilisateur);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (credential) => {
    setError(null);
    try {
      const response = await api.loginWithGoogle(credential);
      api.setToken(response.accessToken);
      setUser(response.utilisateur);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    const drafts = await api.pendingDrafts().catch(() => []);
    if (drafts.length && !window.confirm('Des brouillons locaux ne sont pas encore transmis. La déconnexion les effacera. Annuler pour les sauvegarder depuis « Mode hors ligne » ? Confirmer pour se déconnecter et les effacer.')) return false;
    api.clearToken();
    setUser(null);
    return true;
  };

  const updateProfile = async (data) => {
    const profile = await api.updateProfile(data);
    setUser(profile);
    return profile;
  };
  const renewOfflineSession = async (credentials) => {
    const profile = await api.renewOfflineSession(credentials);
    setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, loginWithGoogle, logout, updateProfile, renewOfflineSession }}>
      {children}
    </AuthContext.Provider>
  );
}
