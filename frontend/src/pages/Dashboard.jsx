
import React from 'react';
import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="glass-panel card animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p className="stat-label">{title}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <div style={{
                background: `rgba(${color}, 0.2)`,
                padding: '10px',
                borderRadius: '12px',
                color: `rgb(${color})`
            }}>
                <Icon size={24} />
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
            <span style={{ color: change >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {change >= 0 ? '+' : ''}{change}%
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>vs last 24h</span>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Moon Dev. Here's your portfolio overview.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard
                    title="Total Balance"
                    value="$124,592.00"
                    change={2.5}
                    icon={DollarSign}
                    color="59, 130, 246" // Blue
                />
                <StatCard
                    title="US Stocks"
                    value="$45,231.50"
                    change={1.2}
                    icon={TrendingUp}
                    color="16, 185, 129" // Green
                />
                <StatCard
                    title="Crypto"
                    value="$78,120.80"
                    change={-0.8}
                    icon={Zap}
                    color="245, 158, 11" // Orange
                />
                <StatCard
                    title="Active Agents"
                    value="4"
                    change={0}
                    icon={Activity}
                    color="139, 92, 246" // Purple
                />
            </div>

            <div className="glass-panel card">
                <h2 style={{ marginBottom: '20px' }}>Recent Activity</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Asset</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Type</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Action</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Amount</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { asset: 'AAPL', type: 'Stock', action: 'Buy', amount: '$1,200.00', status: 'Completed' },
                                { asset: 'BTC', type: 'Crypto', action: 'Sell', amount: '$5,400.00', status: 'Completed' },
                                { asset: 'TSLA', type: 'Stock', action: 'Buy', amount: '$3,000.00', status: 'Pending' },
                                { asset: 'ETH', type: 'Crypto', action: 'Buy', amount: '$800.00', status: 'Completed' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '15px', fontWeight: 600 }}>{row.asset}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            background: row.type === 'Stock' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: row.type === 'Stock' ? '#3b82f6' : '#f59e0b',
                                            fontSize: '0.8rem'
                                        }}>{row.type}</span>
                                    </td>
                                    <td style={{ padding: '15px', color: row.action === 'Buy' ? 'var(--success)' : 'var(--danger)' }}>{row.action}</td>
                                    <td style={{ padding: '15px' }}>{row.amount}</td>
                                    <td style={{ padding: '15px' }}>{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
