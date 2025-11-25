
import React, { useState, useEffect } from 'react';
import { Play, Square, Terminal, Activity } from 'lucide-react';
import { api } from '../services/api';

const AgentCard = ({ name, description, status, onStart, onStop }) => (
    <div className="glass-panel card animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{
                    background: status === 'running' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    padding: '12px',
                    borderRadius: '12px',
                    color: status === 'running' ? 'var(--success)' : 'var(--warning)'
                }}>
                    <Activity size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0 }}>{name}</h3>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{description}</p>
                </div>
            </div>
            <div style={{
                padding: '5px 10px',
                borderRadius: '20px',
                background: status === 'running' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                color: status === 'running' ? 'var(--success)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase'
            }}>
                {status}
            </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', marginBottom: '20px', height: '150px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '5px' }}>$ system check...</div>
            {status === 'running' ? (
                <>
                    <div style={{ color: 'var(--success)' }}>[INFO] Agent initialized successfully</div>
                    <div>[INFO] Connecting to market data stream...</div>
                    <div>[INFO] Analyzing market conditions...</div>
                    <div>[INFO] Strategy "Vortigen Alpha" active</div>
                </>
            ) : (
                <div>[INFO] System standby. Waiting for user command...</div>
            )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            {status !== 'running' ? (
                <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={onStart}>
                    <Play size={16} /> Start Agent
                </button>
            ) : (
                <button className="btn-primary" style={{ flex: 1, background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={onStop}>
                    <Square size={16} /> Stop Agent
                </button>
            )}
            <button className="btn-secondary" style={{ padding: '10px' }}>
                <Terminal size={20} />
            </button>
        </div>
    </div>
);

const Agents = () => {
    const [agents, setAgents] = useState({
        trading_agent: 'stopped',
        polymarket_agent: 'stopped',
        sentiment_agent: 'stopped'
    });

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.getAgentsStatus();
            setAgents(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            console.error("Error fetching agent status:", error);
        }
    };

    const toggleAgent = async (name, currentStatus) => {
        try {
            if (currentStatus === 'running') {
                await api.stopAgent(name);
            } else {
                await api.startAgent(name);
            }
            fetchStatus();
        } catch (error) {
            alert('Failed to toggle agent: ' + error.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>AI Agents</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor your autonomous trading agents.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                <AgentCard
                    name="Trading Agent"
                    description="Autonomous crypto trading bot with multi-strategy support."
                    status={agents.trading_agent}
                    onStart={() => toggleAgent('trading_agent', agents.trading_agent)}
                    onStop={() => toggleAgent('trading_agent', agents.trading_agent)}
                />
                <AgentCard
                    name="Polymarket Agent"
                    description="Prediction market arbitrage and betting agent."
                    status={agents.polymarket_agent}
                    onStart={() => toggleAgent('polymarket_agent', agents.polymarket_agent)}
                    onStop={() => toggleAgent('polymarket_agent', agents.polymarket_agent)}
                />
                <AgentCard
                    name="Sentiment Agent"
                    description="Social media sentiment analysis and signal generation."
                    status={agents.sentiment_agent || 'stopped'}
                    onStart={() => toggleAgent('sentiment_agent', agents.sentiment_agent || 'stopped')}
                    onStop={() => toggleAgent('sentiment_agent', agents.sentiment_agent || 'stopped')}
                />
            </div>
        </div>
    );
};

export default Agents;
