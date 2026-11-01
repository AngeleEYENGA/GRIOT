import { useEffect, useState } from 'react';

export default function InstallAppButton({ compact = false }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    setInstalled(standalone);

    const capturePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Installer GRIOT sur cet appareil"
        className={`griot-button griot-install-button${compact ? ' is-compact' : ''}`}
        onClick={install}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
          <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
        </svg>
        <span>Installer l’application</span>
      </button>
      {showHelp && (
        <div className="griot-install-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowHelp(false);
        }}>
          <section className="griot-install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title">
            <button type="button" className="griot-install-close" onClick={() => setShowHelp(false)} aria-label="Fermer">×</button>
            <span className="griot-install-mark" aria-hidden="true">↓</span>
            <h2 id="install-title">Emportez GRIOT avec vous</h2>
            <p>Ajoutez GRIOT à votre écran d’accueil depuis le menu de votre navigateur. L’application s’ouvrira ensuite dans sa propre fenêtre.</p>
            <p className="griot-install-hint"><strong>Sur iPhone ou iPad :</strong> touchez Partager, puis « Sur l’écran d’accueil ».</p>
            <button type="button" className="griot-button griot-button-primary" onClick={() => setShowHelp(false)}>J’ai compris</button>
          </section>
        </div>
      )}
    </>
  );
}
