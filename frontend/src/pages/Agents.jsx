import React, { useState, useEffect } from 'react';
import { Activity, Play, Square, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
import { useApp, actions } from '../context/AppContext';
import { api } from '../services/api';

const Agents = () => {
    const { state, dispatch, ActionTypes } = useApp();
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

    // Fetch agents status on mount
    useEffect(() => {
        fetchAgentsStatus();
        // Refresh every 10 seconds
        const interval = setInterval(fetchAgentsStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchAgentsStatus = async () => {
        try {
            const response = await api.getAgentsStatus();
            if (response.data.success) {
                dispatch({
                    type: ActionTypes.SET_AGENTS,
                    payload: response.data.data
                });
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
            dispatch(actions.addNotification('error', error.message));
        }
    };

    const handleToggleAgent = async (agentName) => {
        setLoading(true);
        try {
            const agent = state.agents[agentName];
            const isRunning = agent?.status === 'running';

            if (isRunning) {
                await api.stopAgent(agentName);
                dispatch(actions.addNotification('success', `${agentName} stopped`));
            } else {
                await api.startAgent(agentName);
                dispatch(actions.addNotification('success', `${agentName} started`));
            }

            // Refresh status
            await fetchAgentsStatus();
        } catch (error) {
            dispatch(actions.addNotification('error', `Failed to toggle ${agentName}: ${error.message}`));
        } finally {
            setLoading(false);
        }
    };

    const getHealthColor = (health) => {
        if (health >= 80) return 'var(--success)';
        if (health >= 50) return '#f59e0b';
        return 'var(--danger)';
    };

    const getHealthStatus = (health) => {
        if (health >= 80) return 'Healthy';
        if (health >= 50) return 'Degraded';
        return 'Critical';
    };

    const agentDescriptions = {
        trading_agent: 'Autonomous crypto trading with 6-model swarm consensus',
        polymarket_agent: 'Prediction market analysis and trading signals',
        sentiment_agent: 'Twitter sentiment tracking and analysis',
        whale_agent: 'Whale wallet monitoring and alerts',
        risk_agent: 'Portfolio risk management and monitoring'
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>AI Agents</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Manage and monitor your autonomous trading agents
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '10px 20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        Connection Status
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: state.isConnected ? 'var(--success)' : 'var(--danger)',
                            boxShadow: state.isConnected ? '0 0 10px var(--success)' : 'none',
                            animation: state.isConnected ? 'pulse 2s infinite' : 'none'
                        }}></div>
                        <span style={{ fontWeight: 600 }}>
                            {state.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Agent Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {Object.entries(state.agents || {}).map(([agentName, agentData]) => {
                    const isRunning = agentData.status === 'running';
                    const health = agentData.health || 100;

                    return (
                        <div key={agentName} className="glass-panel card">
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                                    <div style={{
                                        background: isRunning ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        color: isRunning ? 'var(--success)' : 'var(--text-secondary)'
                                    }}>
                                        <Activity size={24} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                            {agentName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </h3>
                                        <p style={{
                                            margin: '5px 0 0 0',
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {agentDescriptions[agentName] || 'AI trading agent'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '5px 10px',
                                    borderRadius: '20px',
                                    background: isRunning ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                    color: isRunning ? 'var(--success)' : 'var(--text-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {isRunning ? 'Running' : 'Stopped'}
                                </div>
                            </div>

                            {/* Health Bar */}
                            {isRunning && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Health</span>
                                        <span style={{ color: getHealthColor(health), fontWeight: 600 }}>
                                            {getHealthStatus(health)} ({health.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: 'var(--bg-primary)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${health}%`,
                                            height: '100%',
                                            background: getHealthColor(health),
                                            transition: 'width 0.3s ease',
                                            boxShadow: `0 0 10px ${getHealthColor(health)}`
                                        }}></div>
                                    </div>
                                </div>
                            )}

                            {/* Logs */}
                            <div style={{
                                background: 'var(--bg-primary)',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                height: '120px',
                                overflowY: 'auto',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                color: 'var(--text-secondary)'
                            }}>
                                {isRunning ? (
                                    <>
                                        <div style={{ color: 'var(--success)' }}>
                                            [{new Date().toLocaleTimeString()}] [INFO] Agent active
                                        </div>
                                        <div>
                                            [{new Date().toLocaleTimeString()}] [INFO] Monitoring market conditions...
                                        </div>
                                        {agentData.last_activity && (
                                            <div>
                                                [{new Date(agentData.last_activity).toLocaleTimeString()}] [INFO] Last activity recorded
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div>[INFO] Agent standby</div>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        background: isRunning ? 'var(--danger)' : 'var(--accent-gradient)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onClick={() => handleToggleAgent(agentName)}
                                    disabled={loading || !state.isConnected}
                                >
                                    {isRunning ? <Square size={16} /> : <Play size={16} />}
                                    {loading ? 'Processing...' : (isRunning ? 'Stop' : 'Start')}
                                </button>
                                <button
                                    className="btn-secondary"
                                    style={{
                                        padding: '10px 15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => setSelectedAgent(agentName)}
                                    disabled={!state.isConnected}
                                >
                                    <SettingsIcon size={16} />
                                </button>
                            </div>

                            {/* Last Activity */}
                            {agentData.last_activity && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '10px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Last activity: {new Date(agentData.last_activity).toLocaleString()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {Object.keys(state.agents || {}).length === 0 && (
                <div className="glass-panel card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Activity size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 20px' }} />
                    <h3 style={{ marginBottom: '10px' }}>No Agents Available</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        {state.isConnected
                            ? 'Agents are loading...'
                            : 'Please check if the backend server is running.'}
                    </p>
                    {!state.isConnected && (
                        <button className="btn-primary" onClick={fetchAgentsStatus}>
                            Retry Connection
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Agents;
