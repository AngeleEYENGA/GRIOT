import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import api from '../api/client';

export default function AccountPage({ onLogout, onBack }) {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ nom: user.nom || '', prenom: user.prenom || '', telephone: user.telephone || '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [profileReady, setProfileReady] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [account, setAccount] = useState(user);
  useEffect(() => {
    let cancelled = false;
    setProfileLoadError('');
    api.getProfile().then((saved) => {
      if (cancelled) return;
      setProfile({ nom: saved.nom || '', prenom: saved.prenom || '', telephone: saved.telephone || '' });
      setAccount(saved);
      setProfileReady(true);
    }).catch((error) => {
      if (!cancelled) setProfileLoadError(error.message);
    });
    return () => { cancelled = true; };
  }, [reload]);
  const rules = [
    ['Au moins 8 caractères', passwords.next.length >= 8],
    ['Une majuscule et une minuscule', /[A-Z]/.test(passwords.next) && /[a-z]/.test(passwords.next)],
    ['Au moins un chiffre', /\d/.test(passwords.next)],
  ];
  const saveProfile = async (event) => {
    event.preventDefault();
    if (!profileReady) return;
    setProfileFeedback(null);
    setProfileBusy(true);
    try {
      const saved = await updateProfile({ nom: profile.nom.trim(), prenom: profile.prenom.trim(), telephone: profile.telephone.trim() });
      setProfile({ nom: saved.nom, prenom: saved.prenom, telephone: saved.telephone || '' });
      setProfileFeedback({ ok: true, text: 'Vos informations ont été enregistrées.' });
    } catch (error) {
      setProfileFeedback({ ok: false, text: error.message });
    } finally { setProfileBusy(false); }
  };
  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordFeedback(null);
    if (!rules.every(([, valid]) => valid)) {
      setPasswordFeedback({ ok: false, text: 'Respectez les trois critères du nouveau mot de passe.' });
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordFeedback({ ok: false, text: 'La confirmation ne correspond pas au nouveau mot de passe.' });
      return;
    }
    setPasswordBusy(true);
    try {
      await api.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordFeedback({ ok: true, text: 'Votre mot de passe a été mis à jour.' });
    } catch (error) {
      setPasswordFeedback({ ok: false, text: error.message });
    } finally { setPasswordBusy(false); }
  };
  const feedback = (message) => message && <p className={`griot-account-feedback${message.ok ? ' is-success' : ''}`} role={message.ok ? 'status' : 'alert'}>{message.text}</p>;

  return (
    <div className="griot-account-page">
      <button className="griot-dashboard-text-link" onClick={onBack}>← Retour au tableau de bord</button>
      <header className="griot-account-hero">
        <span className="griot-account-monogram" aria-hidden="true">{user.prenom?.[0]}{user.nom?.[0]}</span>
        <div><p className="griot-eyebrow">VOTRE ESPACE PERSONNEL</p><h1>Mon compte</h1><p>Vos informations, vos accès et votre place dans la mémoire familiale.</p></div>
        <span className="griot-account-badge">Compte {account.statut === 'actif' ? 'actif' : account.statut || 'personnel'}</span>
      </header>
      <div className="griot-account-layout">
        <section className="griot-account-card">
          <p className="griot-eyebrow">01 · PROFIL</p><h2>Faisons connaissance</h2><p>Ces informations permettent à vos proches de vous reconnaître dans les espaces partagés.</p>
          <form onSubmit={saveProfile} className="griot-account-form">
            {!profileReady && <p role="status">{profileLoadError || 'Chargement de vos informations…'}</p>}
            {profileLoadError && <button type="button" className="griot-dashboard-text-link" onClick={() => setReload((value) => value + 1)}>Réessayer le chargement</button>}
            <fieldset className="griot-account-fieldset" disabled={!profileReady || profileBusy}>
            <div className="griot-account-fields">
              {['prenom', 'nom'].map((field) => <label key={field}>{field === 'prenom' ? 'Prénom' : 'Nom'}<input autoComplete={field === 'prenom' ? 'given-name' : 'family-name'} value={profile[field]} onChange={(event) => setProfile({ ...profile, [field]: event.target.value })} required pattern=".*\S.*" maxLength={100} /></label>)}
            </div>
            <label>Adresse e-mail<input type="email" value={user.email || ''} readOnly /><small>Votre identifiant de connexion. La modification de l’adresse e-mail n’est pas disponible.</small></label>
            <label>Téléphone <span className="griot-muted">(facultatif)</span><input type="tel" autoComplete="tel" maxLength={30} value={profile.telephone} onChange={(event) => setProfile({ ...profile, telephone: event.target.value })} placeholder="Votre numéro de téléphone" /></label>
            {feedback(profileFeedback)}
            <button className="griot-button griot-button-primary" disabled={profileBusy}>{profileBusy ? 'Enregistrement…' : 'Enregistrer mon profil'}</button>
            </fieldset>
          </form>
        </section>
        <section className="griot-account-card">
          <p className="griot-eyebrow">02 · SÉCURITÉ</p><h2>Protégez votre accès</h2><p>Choisissez un mot de passe unique. Si vous utilisez Google, gérez votre mot de passe depuis votre compte Google.</p>
          <form onSubmit={savePassword} className="griot-account-form">
            <label>Mot de passe actuel<input type="password" autoComplete="current-password" required value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} /></label>
            <label>Nouveau mot de passe<input type="password" autoComplete="new-password" required minLength={8} value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} aria-describedby="password-rules" /></label>
            <ul id="password-rules" className="griot-password-rules">{rules.map(([label, valid]) => <li key={label} className={valid ? 'is-valid' : ''}><span aria-hidden="true">{valid ? '✓' : '○'}</span> {label}</li>)}</ul>
            <label>Confirmer le nouveau mot de passe<input type="password" autoComplete="new-password" required value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} /></label>
            {feedback(passwordFeedback)}
            <button className="griot-button griot-button-outline" disabled={passwordBusy}>{passwordBusy ? 'Mise à jour…' : 'Modifier mon mot de passe'}</button>
          </form>
        </section>
      </div>
      <section className="griot-account-footer"><div><h2>Votre compte, vos espaces familiaux</h2><p>Votre profil est personnel. Les droits de lecture et de contribution dépendent du rôle qui vous est attribué dans chaque arbre.</p><small>{account.dateCreation ? `Membre depuis le ${new Date(account.dateCreation).toLocaleDateString('fr-FR')}` : 'Retrouvez vos arbres depuis le tableau de bord.'}</small></div><button className="griot-button griot-button-outline" onClick={onLogout}>Se déconnecter de cet appareil</button></section>
    </div>
  );
}
