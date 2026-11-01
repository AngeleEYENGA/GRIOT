import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/useAuth';
import { GoogleLogin } from '@react-oauth/google';

export function NetworkStatus({ onOpen }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [count, setCount] = useState(0);
  const [cachedAt, setCachedAt] = useState(api.lastCachedAt);
  useEffect(() => {
    const refresh = () => { setOnline(navigator.onLine); setCachedAt(api.lastCachedAt); api.pendingDrafts().then((items) => setCount(items.length)).catch(() => {}); };
    refresh();
    ['online', 'offline', 'griot-offline-change'].forEach((event) => window.addEventListener(event, refresh));
    return () => ['online', 'offline', 'griot-offline-change'].forEach((event) => window.removeEventListener(event, refresh));
  }, []);
  if (online && !count && !cachedAt) return null;
  return <aside className="griot-network-status" role="status"><strong>{online ? cachedAt ? 'Copie locale' : 'Connexion rétablie' : 'Hors réseau'}</strong><span>{count ? `${count} brouillon(s) local(aux), non publié(s).` : `Vous consultez des copies préparées sur cet appareil${cachedAt ? ` le ${new Date(cachedAt).toLocaleString('fr-FR')}` : ''}. Les données peuvent être anciennes.`}</span><button onClick={onOpen}>Gérer le mode hors ligne →</button></aside>;
}

export default function OfflinePage() {
  const { user, renewOfflineSession } = useAuth();
  const [password, setPassword] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(api.offlineEnabled());
  const [prepared, setPrepared] = useState(localStorage.getItem(`griot-offline-prepared:${api.offlineUser}`));
  const refresh = async () => { setDrafts(await api.pendingDrafts()); setEnabled(api.offlineEnabled()); setPrepared(localStorage.getItem(`griot-offline-prepared:${api.offlineUser}`)); };
  useEffect(() => { refresh().catch(() => setMessage('Le stockage local est indisponible dans ce navigateur.')); }, []);
  const act = async (task) => {
    setBusy(true); setMessage('');
    try { const result = await task(); setMessage(result || 'Opération terminée. Rechargez le tableau de bord pour retrouver les données actualisées.'); }
    catch (error) { setMessage(error.message); }
    finally { await refresh().catch(() => {}); setBusy(false); }
  };
  const exportDrafts = async () => {
    const data = await api.exportDrafts();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'griot-brouillons-hors-ligne.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="griot-offline-page"><p className="griot-eyebrow">TRANSMETTRE MÊME LOIN DU RÉSEAU</p><h1>Mode hors ligne</h1><p>Préparez vos arbres avant de partir au village. Retrouvez ensuite les personnes, liens, récits et parcours sans connexion, sur cet appareil.</p><section className="griot-settings-card"><h2>Préparer mon appareil</h2><p>Cette option conserve une copie des informations familiales dans le navigateur de cet appareil. Activez-la sur un appareil personnel protégé. Les fichiers photo, audio et vidéo ne sont pas téléchargés.</p><p><strong>{enabled ? 'Copie locale activée' : 'Copie locale désactivée'}</strong>{prepared ? ` · Dernière préparation : ${new Date(prepared).toLocaleString('fr-FR')}` : ''}</p><p>Ouvrez GRIOT une première fois en ligne et laissez la préparation se terminer. Le navigateur peut supprimer son stockage s’il manque d’espace ; conservez une sauvegarde de vos notes importantes.</p><button disabled={busy || Boolean(drafts.length)} className="griot-button griot-button-primary" onClick={() => act(async () => { const count = await api.prepareOffline(); return `${count} arbre(s) préparé(s). L’interface et le fond cartographique sont disponibles après chargement complet de l’application.`; })}>{busy ? 'Opération en cours…' : enabled ? 'Actualiser mes copies' : 'Activer et préparer mes arbres'}</button></section><section className="griot-settings-card"><h2>Brouillons à transmettre</h2><p>Hors réseau, les ajouts de personnes, souvenirs textuels, lieux et relations sont des brouillons locaux. Ils ne sont pas visibles par la famille avant leur envoi et l’acceptation par le serveur. Les modifications, suppressions, invitations et médias nécessitent le réseau.</p><p>{drafts.length} brouillon(s) en attente. L’envoi reste volontaire ; les droits sont revérifiés en ligne.</p><ol>{drafts.map((draft) => <li key={draft.id}><strong>{draft.body.titre || [draft.body.prenom, draft.body.nom].filter(Boolean).join(' ') || draft.body.lieu || draft.body.typeRelation}</strong> · {new Date(draft.dateCreation).toLocaleString('fr-FR')}{draft.uncertain && <p>Envoi non confirmé : vérifiez l’arbre en ligne. Ce brouillon est bloqué pour éviter un doublon. Exportez-le pour demander de l’aide.</p>}</li>)}</ol><div className="griot-setting-options"><button disabled={busy || !drafts.length} className="griot-button griot-button-primary" onClick={() => act(async () => { await api.syncDrafts(); return 'Brouillons transmis. Rechargez les écrans familiaux pour consulter les informations validées.'; })}>Envoyer les brouillons</button><button disabled={busy || !drafts.length} className="griot-button griot-button-outline" onClick={() => act(async () => { await exportDrafts(); return 'Copie des brouillons téléchargée. Ce fichier contient vos informations familiales : conservez-le avec soin.'; })}>Sauvegarder mes brouillons</button></div></section><section className="griot-settings-card"><h2>Reprendre la connexion sans perdre les brouillons</h2><p>Si votre session a expiré pendant le séjour, reconnectez le même compte ici avant d’envoyer vos brouillons. Cette connexion conserve les copies locales.</p><form className="griot-account-form" onSubmit={(event) => { event.preventDefault(); act(async () => { try { await renewOfflineSession({ email: user.email, motDePasse: password }); return 'Connexion renouvelée. Vous pouvez envoyer les brouillons.'; } finally { setPassword(''); } }); }}><label>Compte<input type="email" readOnly value={user.email} autoComplete="username" /></label><label>Mot de passe<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label><button className="griot-button griot-button-outline" disabled={busy}>Renouveler ma connexion</button></form>{import.meta.env.VITE_GOOGLE_CLIENT_ID && !busy && <div className="griot-setting-options"><GoogleLogin onSuccess={({ credential }) => act(async () => { await renewOfflineSession({ credential }); return 'Connexion Google renouvelée. Vous pouvez envoyer les brouillons.'; })} onError={() => setMessage('Connexion Google impossible. Réessayez avec le compte utilisé pour préparer les arbres.')} /></div>}</section><section className="griot-settings-card"><h2>Retirer les données de cet appareil</h2><p>La déconnexion efface les copies et les brouillons de ce compte sur cet appareil. Exportez les brouillons avant de les retirer. Cette action ne supprime rien dans l’arbre en ligne.</p><button className="griot-button griot-button-outline" disabled={busy || !enabled} onClick={() => { if (confirm('Effacer les copies et tous les brouillons locaux de cet appareil ? Les données du serveur sont conservées.')) act(async () => { await api.removeOffline(); return 'Copies et brouillons locaux effacés.'; }); }}>Effacer mes copies locales</button></section>{message && <p className="griot-place-message" role="status">{message}</p>}</section>;
}
