
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationContainer from './components/NotificationContainer';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import USStocks from './pages/USStocks';
import Agents from './pages/Agents';
import CryptoPolymarket from './pages/CryptoPolymarket';

// Placeholder components for now
const Settings = () => <div className="animate-fade-in"><h1>Settings</h1><p>Configuration options...</p></div>;

function AppContent() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <NotificationContainer />
        <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
        <div className="grid-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stocks" element={<USStocks />} />
              <Route path="/crypto" element={<CryptoPolymarket />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
