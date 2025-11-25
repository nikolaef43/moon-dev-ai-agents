import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp, actions } from '../context/AppContext';
import { api } from '../services/api';

const Dashboard = () => {
    const { state, dispatch } = useApp();
    const [stats, setStats] = useState({
        totalBalance: 0,
        usStocks: 0,
        crypto: 0,
        activeAgents: 0,
        change24h: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch account data
            const accountResponse = await api.getUSStockAccount();
            const agentsResponse = await api.getAgentsStatus();

            if (accountResponse.data.success) {
                const account = accountResponse.data.data;
                const equity = parseFloat(account.equity) || 0;
                const buyingPower = parseFloat(account.buying_power) || 0;

                setStats({
                    totalBalance: equity + buyingPower,
                    usStocks: equity,
                    crypto: 0, // TODO: Add crypto balance
                    activeAgents: Object.values(agentsResponse.data.data || {}).filter(a => a.status === 'running').length,
                    change24h: Math.random() * 10 - 5 // Mock for now
                });
            }

            // Fetch recent activity from agent logs
            const agentNames = Object.keys(agentsResponse.data.data || {});
            const logsPromises = agentNames.map(name => api.getAgentLogs(name, 5));
            const logsResults = await Promise.all(logsPromises);
            const combinedLogs = [];
            logsResults.forEach((res, idx) => {
                if (res.data.success && Array.isArray(res.data.logs)) {
                    res.data.logs.forEach(log => {
                        combinedLogs.push({
                            id: `${agentNames[idx]}-${log.timestamp}`,
                            type: 'log',
                            message: log.message,
                            timestamp: log.timestamp,
                            status: log.level.toLowerCase()
                        });
                    });
                }
            });
            // Sort by timestamp descending and take latest 5
            combinedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setRecentActivity(combinedLogs.slice(0, 5));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            dispatch(actions.addNotification('error', `Failed to load dashboard: ${error.message}`));
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon, label, value, change, color }) => (
        <div className="glass-panel card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
                        {loading ? '...' : value}
                    </div>
                    {change !== undefined && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: change >= 0 ? 'var(--success)' : 'var(--danger)',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}>
                            {change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            {Math.abs(change).toFixed(2)}%
                        </div>
                    )}
                </div>
                <div style={{
                    background: color || 'var(--accent-gradient)',
                    padding: '12px',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Welcome back! Here's your portfolio overview.
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: state.isConnected ? 'var(--success)' : 'var(--danger)',
                        boxShadow: state.isConnected ? '0 0 10px var(--success)' : 'none',
                        animation: state.isConnected ? 'pulse 2s infinite' : 'none'
                    }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {state.isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
            </header>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <StatCard
                    icon={<DollarSign size={24} />}
                    label="Total Balance"
                    value={`$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    change={stats.change24h}
                    color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
                <StatCard
                    icon={<TrendingUp size={24} />}
                    label="US Stocks"
                    value={`$${stats.usStocks.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                />
                <StatCard
                    icon={<Activity size={24} />}
                    label="Crypto"
                    value={`$${stats.crypto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                />
                <StatCard
                    icon={<Users size={24} />}
                    label="Active Agents"
                    value={stats.activeAgents}
                    color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                />
            </div>

            {/* Recent Activity */}
            <div className="glass-panel card">
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={24} style={{ color: 'var(--accent-primary)' }} />
                    Recent Activity
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        Loading activity...
                    </div>
                ) : recentActivity.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No recent activity
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {recentActivity.map((activity) => (
                            <div
                                key={activity.id}
                                style={{
                                    padding: '15px',
                                    background: 'var(--bg-primary)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderLeft: `3px solid ${activity.status === 'success' ? 'var(--success)' :
                                        activity.status === 'warning' ? '#f59e0b' :
                                            activity.status === 'error' ? 'var(--danger)' :
                                                'var(--accent-primary)'
                                        }`
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, marginBottom: '5px' }}>
                                        {activity.message}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    background:
                                        activity.status === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                            activity.status === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                                activity.status === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                                                    'rgba(59, 130, 246, 0.1)',
                                    color:
                                        activity.status === 'success' ? 'var(--success)' :
                                            activity.status === 'warning' ? '#f59e0b' :
                                                activity.status === 'error' ? 'var(--danger)' :
                                                    'var(--accent-primary)'
                                }}>
                                    {activity.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginTop: '30px'
            }}>
                <button className="btn-primary" style={{ padding: '15px' }}>
                    <TrendingUp size={20} style={{ marginRight: '8px' }} />
                    Trade US Stocks
                </button>
                <button className="btn-primary" style={{ padding: '15px' }}>
                    <Activity size={20} style={{ marginRight: '8px' }} />
                    Manage Agents
                </button>
                <button className="btn-secondary" style={{ padding: '15px' }}>
                    <DollarSign size={20} style={{ marginRight: '8px' }} />
                    View Analytics
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
