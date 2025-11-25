import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Zap, Target, Brain, RefreshCw } from 'lucide-react';
import { useApp, actions } from '../context/AppContext';
import { api } from '../services/api';

const CryptoPolymarket = () => {
    const { state, dispatch } = useApp();
    const [activeTab, setActiveTab] = useState('polymarket'); // 'polymarket' or 'crypto'
    const [polymarketData, setPolymarketData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'polymarket') {
            fetchPolymarketData();
        }
    }, [activeTab]);

    const fetchPolymarketData = async () => {
        setLoading(true);
        try {
            const [marketsRes, predictionsRes] = await Promise.all([
                api.getPolymarketMarkets(20),
                api.getPolymarketPredictions()
            ]);

            if (marketsRes.data.success) {
                setPolymarketData(marketsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch Polymarket data:', error);
            dispatch(actions.addNotification('error', `Failed to load Polymarket data: ${error.message}`));

            // Set mock data as fallback
            setPolymarketData({
                markets: [
                    { title: 'Will Bitcoin reach $100k by end of 2025?', odds: 0.65, volume: 125000 },
                    { title: 'Trump wins 2024 election?', odds: 0.52, volume: 2500000 },
                    { title: 'AI achieves AGI by 2026?', odds: 0.12, volume: 45000 },
                ],
                consensus_picks: [
                    { market: 'Bitcoin $100k', side: 'YES', consensus: '5/6 models', confidence: 83 },
                    { market: 'Trump 2024', side: 'NO', consensus: '4/6 models', confidence: 67 },
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleCryptoAgent = async (agentName) => {
        try {
            const agent = state.agents[agentName];
            const isRunning = agent?.status === 'running';

            if (isRunning) {
                await api.stopAgent(agentName);
            } else {
                await api.startAgent(agentName);
            }

            dispatch(actions.addNotification('success', `${agentName} ${isRunning ? 'stopped' : 'started'}`));
        } catch (error) {
            dispatch(actions.addNotification('error', `Failed to toggle agent: ${error.message}`));
        }
    };

    const cryptoAgents = [
        {
            name: 'trading_agent',
            displayName: 'Trading Agent',
            description: 'Swarm consensus crypto trading (Aster/HyperLiquid/Solana)'
        },
        {
            name: 'sentiment_agent',
            displayName: 'Sentiment Agent',
            description: 'Twitter sentiment analysis and tracking'
        },
        {
            name: 'whale_agent',
            displayName: 'Whale Agent',
            description: 'Whale wallet monitoring and alerts'
        },
    ];

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Crypto & Polymarket</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>AI-powered crypto trading and prediction markets</p>
                </div>
                {activeTab === 'polymarket' && (
                    <button
                        className="btn-secondary"
                        onClick={fetchPolymarketData}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                )}
            </header>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <button
                    className={activeTab === 'polymarket' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('polymarket')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Target size={20} />
                    Polymarket
                </button>
                <button
                    className={activeTab === 'crypto' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('crypto')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <TrendingUp size={20} />
                    Crypto Agents
                </button>
            </div>

            {/* Polymarket Tab */}
            {activeTab === 'polymarket' && (
                <div>
                    {loading ? (
                        <div className="glass-panel card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <Activity size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 20px', animation: 'pulse 2s infinite' }} />
                            <h3>Loading Polymarket data...</h3>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                <div className="glass-panel card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                        <Brain size={24} style={{ color: 'var(--accent-primary)' }} />
                                        <h3 style={{ margin: 0 }}>AI Consensus Picks</h3>
                                    </div>
                                    {polymarketData?.consensus_picks?.length > 0 ? (
                                        polymarketData.consensus_picks.map((pick, i) => (
                                            <div key={i} style={{
                                                padding: '12px',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                borderLeft: '3px solid var(--accent-primary)'
                                            }}>
                                                <div style={{ fontWeight: 600, marginBottom: '5px' }}>{pick.market}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                    <span>Side: <span style={{ color: pick.side === 'YES' ? 'var(--success)' : 'var(--danger)' }}>{pick.side}</span></span>
                                                    <span>{pick.consensus}</span>
                                                </div>
                                                <div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
                                                    Confidence: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{pick.confidence}%</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                            No consensus picks available
                                        </div>
                                    )}
                                </div>

                                <div className="glass-panel card">
                                    <h3 style={{ marginBottom: '15px' }}>Agent Status</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: state.agents?.polymarket_agent?.status === 'running' ? 'var(--success)' : 'var(--text-secondary)',
                                            boxShadow: state.agents?.polymarket_agent?.status === 'running' ? '0 0 10px var(--success)' : 'none',
                                            animation: state.agents?.polymarket_agent?.status === 'running' ? 'pulse 2s infinite' : 'none'
                                        }}></div>
                                        <span style={{ fontWeight: 600 }}>
                                            Polymarket Agent {state.agents?.polymarket_agent?.status === 'running' ? 'Running' : 'Stopped'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <div>📡 WebSocket: {state.isConnected ? 'Connected' : 'Disconnected'}</div>
                                        <div>🤖 Swarm Mode: 6 AI models</div>
                                        <div>📊 Markets Tracked: {polymarketData?.markets?.length || 0}</div>
                                        <div>⏱️ Last Update: {state.lastUpdate ? new Date(state.lastUpdate).toLocaleTimeString() : 'Never'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Markets */}
                            <div className="glass-panel card">
                                <h2 style={{ marginBottom: '20px' }}>Recent Markets</h2>
                                {polymarketData?.markets?.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                                    <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Market</th>
                                                    <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Odds</th>
                                                    <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Volume</th>
                                                    <th style={{ padding: '15px', color: 'var(--text-secondary)' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {polymarketData.markets.map((market, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                        <td style={{ padding: '15px' }}>{market.title}</td>
                                                        <td style={{ padding: '15px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                background: market.odds > 0.5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                color: market.odds > 0.5 ? 'var(--success)' : 'var(--danger)',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                {(market.odds * 100).toFixed(0)}%
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '15px' }}>${(market.volume / 1000).toFixed(0)}k</td>
                                                        <td style={{ padding: '15px' }}>
                                                            <button className="btn-secondary" style={{ padding: '5px 15px', fontSize: '0.85rem' }}>
                                                                View Analysis
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No markets available
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Crypto Agents Tab */}
            {activeTab === 'crypto' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                    {cryptoAgents.map((agent) => {
                        const agentData = state.agents?.[agent.name];
                        const isRunning = agentData?.status === 'running';
                        const health = agentData?.health || 100;

                        return (
                            <div key={agent.name} className="glass-panel card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{
                                            background: isRunning ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            color: isRunning ? 'var(--success)' : 'var(--text-secondary)'
                                        }}>
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{agent.displayName}</h3>
                                            <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {agent.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        background: isRunning ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                        color: isRunning ? 'var(--success)' : 'var(--text-secondary)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase'
                                    }}>
                                        {isRunning ? 'Running' : 'Stopped'}
                                    </div>
                                </div>

                                {isRunning && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Health</span>
                                            <span style={{ color: health >= 80 ? 'var(--success)' : health >= 50 ? '#f59e0b' : 'var(--danger)', fontWeight: 600 }}>
                                                {health.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${health}%`,
                                                height: '100%',
                                                background: health >= 80 ? 'var(--success)' : health >= 50 ? '#f59e0b' : 'var(--danger)',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', marginBottom: '20px', height: '100px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {isRunning ? (
                                        <>
                                            <div style={{ color: 'var(--success)' }}>[INFO] Agent active</div>
                                            <div>[INFO] Monitoring market conditions...</div>
                                        </>
                                    ) : (
                                        <div>[INFO] Agent standby</div>
                                    )}
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        background: isRunning ? 'var(--danger)' : 'var(--accent-gradient)'
                                    }}
                                    onClick={() => toggleCryptoAgent(agent.name)}
                                    disabled={!state.isConnected}
                                >
                                    {isRunning ? 'Stop Agent' : 'Start Agent'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default CryptoPolymarket;
