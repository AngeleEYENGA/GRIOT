import { useState } from 'react';

const navigation = [
  { id: 'tableau', label: 'Tableau de bord', icon: '⌂' },
  { id: 'genealogie', label: 'Arbre généalogique', icon: '⌘' },
  { id: 'personnes', label: 'Fiche personne', icon: '◉' },
  { id: 'membres', label: 'Rôles & permissions', icon: '♧' },
  { id: 'origines', label: 'Carte des origines', icon: '⌖' },
  { id: 'souvenirs', label: 'Mémoire familiale', icon: '▤' },
  { id: 'chefferie', label: 'Espace chefferie', icon: '⌂' },
  { id: 'assistant', label: 'Demander à GRIOT', icon: '✦' },
  { id: 'demo', label: 'Démo multi-écrans', icon: '▣' },
  { id: 'style', label: 'Charte graphique', icon: '◐' },
];

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
  const navigate = (panel) => {
    setMobileMenuOpen(false);
    onNavigate(panel);
  };

  return (
    <div className="griot-shell">
      <aside className="griot-sidebar">
        <button className="griot-brand" onClick={() => navigate('tableau')} aria-label="Accueil GRIOT">
          <img src="/griot-logo.jpeg" alt="" />
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
              <span className="griot-nav-icon" aria-hidden="true">{item.icon}</span>
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
            <span>{treeName || 'Votre espace familial'}</span>
          </div>
          <div className="griot-user-menu">
            <span className="griot-user-name">{user?.prenom} {user?.nom}</span>
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
              <span aria-hidden="true">{item.icon}</span>
              <small>{item.id === 'tableau' ? 'Accueil' : item.label.split(' ')[0]}</small>
            </button>
          ))}
          <button
            className={mobileMenuOpen ? 'is-active' : ''}
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Afficher les autres écrans"
          >
            <span aria-hidden="true">•••</span><small>Plus</small>
          </button>
        </nav>
        {mobileMenuOpen && (
          <nav className="griot-mobile-drawer" aria-label="Autres écrans">
            {navigation.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)} className={active === item.id ? 'is-active' : ''}>
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
