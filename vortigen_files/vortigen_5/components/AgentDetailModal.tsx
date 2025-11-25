import React, { useState, useMemo } from 'react';
import { X, Cpu, Bot, Activity as ActivityIcon, RotateCcw } from 'lucide-react';
import { AiAgent, Activity, AiBot } from '../types';
import { useAppContext } from '../context/AppContext';

interface AgentDetailModalProps {
    agent: AiAgent;
    onClose: () => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agent, onClose }) => {
    const { state, dispatch } = useAppContext();

    const agentActivities = useMemo(() => 
        state.activities.filter(act => act.agent === agent.name).slice(0, 5),
        [state.activities, agent.name]
    );
    
    const agentBots = useMemo(() => 
        agent.bots.map(botName => state.aiBots.find(b => b.name === botName)).filter((b): b is AiBot => !!b),
        [agent.bots, state.aiBots]
    );

    const getHealthColor = (health: number, status: AiAgent['status']): string => {
        if (status === 'error') return 'text-red-400';
        if (health >= 90) return 'text-green-400';
        if (health >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getActivityColor = (type: string) => {
        const colors = {
            'EXECUTION': 'border-cyan-500 text-cyan-400',
            'DECISION': 'border-purple-500 text-purple-400',
            'ALERT': 'border-yellow-500 text-yellow-400',
            'SYSTEM': 'border-slate-600 text-slate-400',
            'ERROR': 'border-red-500 text-red-400',
        };
        return colors[type as keyof typeof colors] || 'border-slate-700';
    };

    const handleResetCircuitBreaker = () => {
        dispatch({ type: 'RESET_AGENT_CIRCUIT_BREAKER', payload: { agentId: agent.id } });
        onClose();
    };
    
    const circuitBreakerReason = useMemo(() => {
        if (agent.status !== 'error') return '';
        if (agent.errorCount >= agent.maxErrors) {
            return `excessive errors (${agent.errorCount}/${agent.maxErrors})`;
        }
        if (agent.currentDrawdown >= agent.maxDrawdown) {
            return `max drawdown exceeded (${(agent.currentDrawdown * 100).toFixed(1)}% / ${(agent.maxDrawdown * 100).toFixed(1)}%)`;
        }
        return 'a critical failure';
    }, [agent]);

    const Metric: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-slate-100' }) => (
        <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
    );

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Cpu size={24} className="text-purple-400" />
                        <h2 className="text-xl font-bold">{agent.name}</h2>
                         <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                            agent.status === 'active' ? 'bg-green-500/20 text-green-300' : 
                            agent.status === 'paused' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                        }`}>{agent.status}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition"><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {agent.status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-sm">
                            <h4 className="font-bold text-red-400 mb-2">Circuit Breaker Tripped</h4>
                            <p className="text-red-300/80 mb-3">This agent has been automatically disabled due to {circuitBreakerReason}. Manual intervention is required to reactivate.</p>
                            <button
                                onClick={handleResetCircuitBreaker}
                                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-semibold flex items-center gap-2"
                            >
                                <RotateCcw size={12} /> Reset Circuit Breaker
                            </button>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Metric label="Health" value={`${agent.health.toFixed(0)}%`} color={getHealthColor(agent.health, agent.status)} />
                        <Metric label="Accuracy" value={`${agent.accuracy}%`} />
                        <Metric label="Latency" value={`${agent.latency}ms`} />
                        <Metric label="Trades" value={agent.trades} />
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2"><Bot size={16}/>Assigned Bots ({agentBots.length})</h4>
                        {agentBots.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {agentBots.map(bot => (
                                    <div key={bot.id} className="bg-slate-800/50 p-3 rounded-md">
                                        <div className="font-bold text-slate-200">{bot.name}</div>
                                        <div className="text-xs text-slate-400">{bot.role}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No bots assigned to this agent.</p>
                        )}
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2"><ActivityIcon size={16}/>Recent Activity</h4>
                        <div className="space-y-2">
                            {agentActivities.length > 0 ? agentActivities.map(activity => (
                                <div key={activity.id} className={`p-2 rounded-md border-l-4 ${getActivityColor(activity.type)}`}>
                                    <p className="text-xs text-slate-300">{activity.message}</p>
                                    <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500">No recent activity for this agent.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};