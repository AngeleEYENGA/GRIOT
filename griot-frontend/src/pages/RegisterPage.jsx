import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage({ onSwitchToLogin }) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">GRIOT</h1>
        <p className="text-gray-600 mb-8">Créer un compte</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {formError || error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Jean"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
          >
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
              <span className="h-px flex-1 bg-gray-200" />
              ou continuer avec
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setFormError('La connexion Google a échoué.')} />
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">Déjà inscrit ?</p>
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-700 font-medium mt-2"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
