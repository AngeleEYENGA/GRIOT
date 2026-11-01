import { useState } from 'react';
import InstallAppButton from './InstallAppButton';
import NotificationCenter from './NotificationCenter';

const navigation = [
  { id: 'tableau', label: 'Tableau de bord' },
  { id: 'genealogie', label: 'Arbre généalogique' },
  { id: 'personnes', label: 'Fiche personne' },
  { id: 'membres', label: 'Rôles & permissions' },
  { id: 'origines', label: 'Carte des origines' },
  { id: 'souvenirs', label: 'Mémoire familiale' },
  { id: 'chefferie', label: 'Espace chefferie' },
  { id: 'institutions', label: 'Console chefferie' },
  { id: 'assistant', label: 'Demander à GRIOT' },
  { id: 'style', label: 'Charte graphique' },
  { id: 'compte', label: 'Mon compte' },
  { id: 'guide', label: 'Guide de navigation' },
];

function NavigationIcon({ name }) {
  const icons = {
    guide: <><circle cx="12" cy="12" r="9" /><path d="M9.5 8a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 3m0 3h.01" /></>,
    tableau: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    genealogie: <><circle cx="12" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /><path d="M12 7v5m-6 5v-2a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2" /></>,
    personnes: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    membres: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0m1-12a3 3 0 0 1 0 6m2 1a5 5 0 0 1 3 5" /></>,
    origines: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    souvenirs: <><path d="M5 3h11l4 4v14H5z" /><path d="M15 3v5h5M8 12h8m-8 4h8" /></>,
    chefferie: <><path d="m3 9 9-6 9 6M4 20h16M6 9v11m4-11v11m4-11v11m4-11v11M3 9h18" /></>,
    institutions: <><path d="m3 9 9-6 9 6M4 20h16M6 9v11m4-11v11m4-11v11m4-11v11M3 9h18" /><path d="M9 5.2h6" /></>,
    assistant: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
    style: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18a9 9 0 0 0 0-18Z" /></>,
    compte: <><circle cx="12" cy="8" r="3" /><path d="M5 21v-2a7 7 0 0 1 14 0v2M4 4l2 2m12 0 2-2" /></>,
  };

  return (
    <svg className="griot-nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function AppShell({
  activePanel,
  children,
  onLogout,
  onNavigate,
  treeName,
  user,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const active = activePanel === 'accueil' ? 'tableau' : activePanel;
  const activePage = navigation.find((item) => item.id === active);
  const navigate = (panel) => {
    setMobileMenuOpen(false);
    onNavigate(panel);
  };

  return (
    <div className="griot-shell">
      <aside className="griot-sidebar">
        <button className="griot-brand" onClick={() => navigate('tableau')} aria-label="Accueil GRIOT">
          <img src="/griot-icon.svg" alt="" />
          <span>
            <strong>GRIOT</strong>
            <small>Mémoire numérique</small>
          </span>
        </button>

        <div className="griot-sidebar-caption">ESPACE FAMILIAL</div>
        <nav className="griot-sidebar-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`griot-nav-item${active === item.id ? ' is-active' : ''}`}
              onClick={() => navigate(item.id)}
              aria-current={active === item.id ? 'page' : undefined}
            >
              <NavigationIcon name={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="griot-sidebar-footer">
          <p>© 2026 GAM Labs</p>
          <span>Préserver. Transmettre. Relier.</span>
        </div>
      </aside>

      <div className="griot-main-column">
        <header className="griot-topbar">
          <div className="griot-topbar-title">
            <span className="griot-mobile-brand">GRIOT</span>
            <span>{treeName || activePage?.label || 'Votre espace familial'}</span>
          </div>
          <div className="griot-user-menu">
            <button className="griot-help-trigger" onClick={() => navigate('guide')} aria-label="Ouvrir le guide de navigation" title="Guide de navigation">?</button>
            <NotificationCenter />
            <InstallAppButton compact />
            <button className="griot-account-trigger" onClick={() => navigate('compte')} aria-label="Ouvrir mon compte" aria-current={active === 'compte' ? 'page' : undefined}>
              <span className="griot-account-avatar" aria-hidden="true">{user?.prenom?.[0]}{user?.nom?.[0]}</span>
              <span className="griot-user-name">{user?.prenom} {user?.nom}</span>
            </button>
            <button className="griot-logout" onClick={onLogout}>Déconnexion</button>
          </div>
        </header>

        <main className="griot-shell-content">{children}</main>

        <nav className="griot-mobile-nav" aria-label="Navigation mobile">
          {['tableau', 'genealogie', 'personnes', 'souvenirs'].map((id) => navigation.find((item) => item.id === id)).map((item) => (
            <button
              key={item.id}
              className={active === item.id ? 'is-active' : ''}
              onClick={() => navigate(item.id)}
              aria-label={item.label}
              aria-current={active === item.id ? 'page' : undefined}
            >
              <NavigationIcon name={item.id} />
              <small>{item.id === 'tableau' ? 'Accueil' : item.label.split(' ')[0]}</small>
            </button>
          ))}
          <button
            className={mobileMenuOpen ? 'is-active' : ''}
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Afficher les autres écrans"
          >
            <span className="griot-nav-more" aria-hidden="true">•••</span><small>Plus</small>
          </button>
        </nav>
        {mobileMenuOpen && (
          <nav className="griot-mobile-drawer" aria-label="Autres écrans">
            {navigation.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)} className={active === item.id ? 'is-active' : ''}>
                <NavigationIcon name={item.id} />{item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
