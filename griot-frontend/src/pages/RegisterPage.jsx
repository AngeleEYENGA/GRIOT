import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage({ onSwitchToLogin, onBackToHome }) {
  const { register, loginWithGoogle, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
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
      await register(
        formData.nom,
        formData.prenom,
        formData.email,
        formData.motDePasse,
        formData.telephone
      );
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
        <h1 className="griot-auth-brand griot-auth-brand-compact">
          <img src="/griot-icon.svg" alt="" />
          <span>GRIOT</span>
          <small>La mémoire numérique des familles</small>
        </h1>
        <p className="griot-auth-title">Créer un compte</p>

        <form onSubmit={handleSubmit} className="griot-auth-form">
          {(formError || error) && (
            <div className="griot-auth-error">
              {formError || error}
            </div>
          )}

          <div className="griot-auth-name-fields">
            <label className="griot-auth-field">Nom
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                placeholder="Mvondo"
              />
            </label>
            <label className="griot-auth-field">Prénom
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                placeholder="Jean"
              />
            </label>
          </div>

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

          <label className="griot-auth-field">Téléphone <span>(optionnel)</span>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+33 6 12 34 56 78"
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
            {loading ? 'Création...' : "S'inscrire"}
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
          <p>Déjà inscrit ?</p>
          <button
            onClick={onSwitchToLogin}
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
