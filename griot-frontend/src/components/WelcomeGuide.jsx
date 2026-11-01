import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';

export default function WelcomeGuide({ onOpen }) {
  const { user } = useAuth();
  const key = `griot-guide-dismissed:${user.id}`;
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });
  if (dismissed) return null;
  return <section className="griot-welcome-guide" aria-label="Aide pour bien démarrer"><span aria-hidden="true">✧</span><div><strong>Première visite ? On vous accompagne.</strong><p>Découvrez où ajouter vos proches, raconter un souvenir et inviter votre famille.</p></div><button className="griot-button griot-button-outline" onClick={onOpen}>Découvrir le guide →</button><button className="griot-guide-dismiss" aria-label="Masquer le conseil de bienvenue" onClick={() => { setDismissed(true); try { localStorage.setItem(key, '1'); } catch { /* Help stays available from navigation. */ } }}>×</button></section>;
}
