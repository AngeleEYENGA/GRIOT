import { useEffect, useState } from 'react';
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
import './index.css';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [authMode, setAuthMode] = useState('home');
  const [selectedTreeId, setSelectedTreeId] = useState(null);
  const [activePanel, setActivePanel] = useState('tableau');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePanel, selectedTreeId]);

  const navigate = (panel) => {
    setActivePanel(panel);
  };
  const handleLogout = () => {
    setSelectedTreeId(null);
    setActivePanel('tableau');
    setAuthMode('home');
    logout();
  };

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
      {activePanel === 'compte' ? (
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
