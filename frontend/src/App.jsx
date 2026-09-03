import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [initialTab, setInitialTab] = useState('dashboard');

  const handleGoToDashboard = (tab = 'dashboard') => {
    setInitialTab(tab);
    setCurrentView('dashboard');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {currentView === 'landing' ? (
        <LandingPage 
          onGoToDashboard={handleGoToDashboard} 
        />
      ) : (
        <div>
          {/* Top navigation header bar for app view */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderBottom: '1px solid #e2e8f0', 
            padding: '10px 28px', 
            display: 'flex', 
            justify: 'space-between', 
            align: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
          }}>
            <button 
              onClick={() => setCurrentView('landing')} 
              style={{ 
                background: 'rgba(2, 132, 199, 0.08)', 
                border: '1px solid rgba(2, 132, 199, 0.2)', 
                color: 'var(--accent-ocean)', 
                padding: '6px 16px', 
                borderRadius: '50px', 
                cursor: 'pointer', 
                fontSize: '0.82rem', 
                fontWeight: 700, 
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← RETURN TO LANDING PAGE
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              COASTX LIVE COMMAND CENTER
            </span>
          </div>

          <Dashboard 
            onGoToLanding={() => setCurrentView('landing')}
            initialTab={initialTab}
          />
        </div>
      )}
    </div>
  );
}
