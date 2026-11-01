import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TreesPage from './pages/TreesPage';
import TreeDetailPage from './pages/TreeDetailPage';
import './index.css';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [selectedTreeId, setSelectedTreeId] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'login') {
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthMode('register')}
        />
      );
    } else {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthMode('login')}
        />
      );
    }
  }

  if (selectedTreeId) {
    return (
      <TreeDetailPage
        treeId={selectedTreeId}
        onBack={() => setSelectedTreeId(null)}
      />
    );
  }

  return (
    <TreesPage
      onSelectTree={setSelectedTreeId}
      onLogout={logout}
    />
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
