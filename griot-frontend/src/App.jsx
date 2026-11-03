import { lazy, Suspense, useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TreesPage from './pages/TreesPage';
import TreeDetailPage from './pages/TreeDetailPage';
import HomePage from './pages/HomePage';
import AppShell from './components/AppShell';
import { StylePanel } from './components/TreeExtraScreens';
import InstitutionSpacePage from './pages/InstitutionSpacePage';
import AccountPage from './pages/AccountPage';
import NavigationGuide from './pages/NavigationGuide';
import WelcomeGuide from './components/WelcomeGuide';
import CompanyPages from './pages/CompanyPages';
import OfflinePage, { NetworkStatus } from './pages/OfflinePage';
import './index.css';

const PublicDemoPage = lazy(() => import('./pages/PublicDemoPage'));
const publicPageFromHash = () => window.location.hash.startsWith('#/demonstrations') ? 'demonstrations' : window.location.hash === '#/a-propos' ? 'apropos' : window.location.hash === '#/contact' ? 'contact' : null;

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [authMode, setAuthMode] = useState('home');
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [activePanel, setActivePanel] = useState('tableau');
  const [publicPage, setPublicPage] = useState(publicPageFromHash);

  useEffect(() => {
    const syncPage = () => {
      setPublicPage(publicPageFromHash());
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', syncPage);
    return () => window.removeEventListener('hashchange', syncPage);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePanel, selectedTreeId]);

  const navigate = (panel) => {
    setActivePanel(panel);
  };
  const handleLogout = async () => {
    if (await logout() === false) return;
    setSelectedTreeId(null);
    setActivePanel('tableau');
    setAuthMode('home');
  };

  if (publicPage === 'demonstrations') return <Suspense fallback={<p>Chargement des exemples publics…</p>}><PublicDemoPage /></Suspense>;

  if (publicPage) {
    return <CompanyPages page={publicPage} loggedIn={Boolean(user)} onLogin={() => { window.location.hash = '/'; setPublicPage(null); setAuthMode('login'); }} onRegister={() => { window.location.hash = '/'; setPublicPage(null); setAuthMode('register'); }} />;
  }

  if (loading) {
    return (
      <div className="griot-loading">
        <img src="/griot-icon.svg" alt="" />
        <strong>GRIOT</strong>
        <span>Préparation de votre espace familial…</span>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'home') {
      return (
        <HomePage
          onLogin={() => setAuthMode('login')}
          onRegister={() => setAuthMode('register')}
        />
      );
    }

    if (authMode === 'login') {
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthMode('register')}
          onBackToHome={() => setAuthMode('home')}
        />
      );
    } else {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthMode('login')}
          onBackToHome={() => setAuthMode('home')}
        />
      );
    }
  }

  return (
    <AppShell
      activePanel={activePanel}
      onLogout={handleLogout}
      onNavigate={navigate}
      user={user}
    >
      <NetworkStatus onOpen={() => setActivePanel('offline')} />
      {activePanel === 'tableau' && !selectedTreeId && <WelcomeGuide key={user.id} onOpen={() => setActivePanel('guide')} />}
      {activePanel === 'offline' ? (
        <OfflinePage />
      ) : activePanel === 'guide' ? (
        <NavigationGuide onNavigate={navigate} />
      ) : activePanel === 'compte' ? (
        <AccountPage onLogout={handleLogout} onBack={() => setActivePanel('tableau')} />
      ) : activePanel === 'institutions' ? (
        <InstitutionSpacePage />
      ) : selectedTreeId ? (
        <TreeDetailPage
          key={selectedTreeId}
          treeId={selectedTreeId}
          activeTab={activePanel}
          onTabChange={setActivePanel}
          onBack={() => {
            setSelectedTreeId(null);
            setActivePanel('tableau');
          }}
        />
      ) : (
        activePanel === 'style' ? (
          <StylePanel />
        ) : (
          <TreesPage
            activePanel={activePanel}
            onSelectTree={(treeId) => {
              setSelectedTreeId(treeId);
            }}
          />
        )
      )}
    </AppShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
