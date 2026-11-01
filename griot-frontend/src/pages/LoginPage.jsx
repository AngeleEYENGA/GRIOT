import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage({ onSwitchToRegister, onBackToHome }) {
  const { login, loginWithGoogle, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      await login(formData.email, formData.motDePasse);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) return;
    setFormError('');
    setLoading(true);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="griot-auth-page">
      <div className="griot-auth-card">
        <button className="griot-auth-back" onClick={onBackToHome}>← Retour à l’accueil</button>
        <h1 className="griot-auth-brand">
          <img src="/griot-icon.svg" alt="" />
          <span>GRIOT</span>
          <small>La mémoire numérique des familles</small>
        </h1>

        <form onSubmit={handleSubmit} className="griot-auth-form">
          {(formError || error) && (
            <div className="griot-auth-error">
              {formError || error}
            </div>
          )}

          <label className="griot-auth-field">Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="vous@exemple.fr"
            />
          </label>

          <label className="griot-auth-field">Mot de passe
            <input
              type="password"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="griot-button griot-button-primary"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div className="griot-auth-google">
            <div className="griot-auth-divider">
              <span />
              ou continuer avec
              <span />
            </div>
            <div className="griot-auth-google-button">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setFormError('La connexion Google a échoué.')} />
            </div>
          </div>
        )}

        <div className="griot-auth-switch">
          <p>Pas encore inscrit ?</p>
          <button
            onClick={onSwitchToRegister}
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}
