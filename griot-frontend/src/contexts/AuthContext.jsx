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
    } catch {
      api.clearToken();
      setUser(null);
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

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
