import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import SubmitComplaint from './components/SubmitComplaint';
import AiChatbot from './components/AiChatbot';
import './index.css';

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState('landing');
  const [prefillText, setPrefillText] = useState('');
  const [aiReasoning, setAiReasoning] = useState('');

  // Redirect to landing/dashboard based on auth state
  useEffect(() => {
    if (user) {
      setPage(p => (p === 'landing' || p === 'auth') ? 'dashboard' : p);
    } else {
      if (page !== 'auth') setPage('landing');
    }
  }, [user, page]);

  return (
    <div className="app-wrapper">
      {user && <Navbar page={page} setPage={setPage} />}

      <main style={{ flex: 1 }}>
        {!user && page === 'landing' && <LandingPage onGetStarted={() => setPage('auth')} />}
        {!user && page === 'auth'    && <AuthPage />}
        
        {user && page === 'dashboard' && <Dashboard />}
        {user && page === 'submit'    && (
          <SubmitComplaint 
            prefillText={prefillText} 
            clearPrefill={() => setPrefillText('')} 
          />
        )}
      </main>

      {user && (
        <footer style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}>
          SmartComplaint System &copy; {new Date().getFullYear()} · Powered by Spring Boot + React + Smart AI
        </footer>
      )}

      {/* Global AI chatbot — shown to all logged-in users */}
      {user && (
        <AiChatbot 
          onStartComplaint={(text) => {
            setPrefillText(text);
            setPage('submit');
          }} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
