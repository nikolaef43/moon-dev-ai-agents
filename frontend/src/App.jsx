
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import USStocks from './pages/USStocks';
import Agents from './pages/Agents';

// Placeholder components for now
const Crypto = () => <div className="animate-fade-in"><h1>Crypto & Polymarket</h1><p>Coming soon...</p></div>;
const Settings = () => <div className="animate-fade-in"><h1>Settings</h1><p>Configuration options...</p></div>;

function App() {
  return (
    <Router>
      <div className="grid-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stocks" element={<USStocks />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
