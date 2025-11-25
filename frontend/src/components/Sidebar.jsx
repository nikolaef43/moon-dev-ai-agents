
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Bitcoin, Bot, Settings, Activity } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/stocks', icon: <TrendingUp size={20} />, label: 'US Stocks' },
    { path: '/crypto', icon: <Bitcoin size={20} />, label: 'Crypto & Poly' },
    { path: '/agents', icon: <Bot size={20} />, label: 'AI Agents' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="logo-container" style={{ padding: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'var(--accent-gradient)', padding: '8px', borderRadius: '8px' }}>
          <Activity color="white" size={24} />
        </div>
        <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>Moon Dev</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              isActive ? 'nav-item active' : 'nav-item'
            }
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-gradient)' : 'transparent',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '20px 0' }}>
        <div className="glass-panel" style={{ padding: '15px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
