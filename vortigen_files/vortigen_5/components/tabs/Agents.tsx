import React, { useState, useMemo } from 'react';
import { Users, Cpu, Zap, PowerOff, Search, AlertTriangle, Filter, Power, XCircle, RotateCcw, Bot } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AiAgent } from '../../types';
import { AgentDetailModal } from '../AgentDetailModal';

const Agents: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { aiAgents, isLiveFeedActive, agentHealthThreshold, agentFilter } = state;
    const [selectedAgent, setSelectedAgent] = useState<AiAgent | null>(null);
    const { query, lowHealthOnly } = agentFilter;

    const getHealthColor = (health: number, status: AiAgent['status']): string => {
        if (status === 'error') return 'text-red-400';
        if (health >= 90) return 'text-green-400';
        if (health >= agentHealthThreshold) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getHealthBgColor = (health: number, status: AiAgent['status']): string => {
        if (status === 'error') return 'bg-red-500';
        if (health >= 90) return 'bg-green-500';
        if (health >= agentHealthThreshold) return 'bg-yellow-500';
        return 'bg-red-500';
    }
    
    const getPriorityColor = (priority: AiAgent['priority']) => {
        switch (priority) {
            case 'critical': return 'border-red-500/50 text-red-400';
            case 'high': return 'border-orange-500/50 text-orange-400';
            case 'medium': return 'border-yellow-500/50 text-yellow-400';
            case 'low': return 'border-sky-500/50 text-sky-400';
            default: return 'border-slate-600 text-slate-400';
        }
    };


    const filteredAgents = useMemo(() => {
        return aiAgents.filter(agent => {
            const matchesSearch = agent.name.toLowerCase().includes(query.toLowerCase());
            const matchesHealth = !lowHealthOnly || agent.health < agentHealthThreshold || agent.status === 'error';
            return matchesSearch && matchesHealth;
        });
    }, [aiAgents, query, lowHealthOnly, agentHealthThreshold]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_AGENT_FILTER', payload: { query: e.target.value } });
    };

    const handleLowHealthToggle = () => {
        dispatch({ type: 'SET_AGENT_FILTER', payload: { lowHealthOnly: !lowHealthOnly } });
    };

    const clearFilters = () => {
        dispatch({ type: 'SET_AGENT_FILTER', payload: { query: '', lowHealthOnly: false } });
    };

    const handleToggleStatus = (e: React.MouseEvent, agentId: string) => {
        e.stopPropagation();
        dispatch({ type: 'TOGGLE_AGENT_STATUS', payload: { agentId } });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3"><Users size={28} className="text-cyan-400"/> AI Agent Network</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search agents..."
                            value={query}
                            onChange={handleSearchChange}
                            className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 w-52 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                     <button
                        onClick={handleLowHealthToggle}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                            lowHealthOnly
                                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        <Filter size={14}/>
                        Low Health
                    </button>
                    <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                        <Power size={14} className={isLiveFeedActive ? 'text-green-400' : 'text-red-400'} />
                        <span>Live Feed</span>
                        <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_LIVE_FEED' })}>
                           <input type="checkbox" id="live-feed-toggle" checked={isLiveFeedActive} readOnly className="absolute w-full h-full opacity-0"/>
                           <div className={`block h-4 rounded-full ${isLiveFeedActive ? 'bg-green-500/50' : 'bg-slate-600'}`}></div>
                           <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${isLiveFeedActive ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {(query || lowHealthOnly) && (
                <div className="mb-4 flex items-center justify-start">
                    <button onClick={clearFilters} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <XCircle size={12}/>
                        Clear Filters
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                    <div 
                        key={agent.id} 
                        onClick={() => setSelectedAgent(agent)}
                        className={`bg-slate-900 rounded-lg border border-slate-800 p-4 flex flex-col text-left transition-all duration-200 hover:border-cyan-500/50 hover:bg-slate-800/20 cursor-pointer ${
                            agent.status === 'error' ? 'ring-2 ring-red-500/80 border-red-500/50' :
                            agent.health < agentHealthThreshold ? 'ring-2 ring-yellow-500/80 border-yellow-500/50' : ''
                        }`}
                    >
                        <div className="flex-grow">
                             <div className="flex justify-between items-start mb-3">
                                <div className="font-bold flex items-center gap-3 text-base">
                                    <div className={`w-2.5 h-2.5 rounded-full ${getHealthBgColor(agent.health, agent.status)}`} title={`Health: ${agent.health}%`}></div>
                                    <Cpu size={18} className="text-purple-400"/> {agent.name}
                                    {agent.status === 'error' ? <AlertTriangle size={16} className="text-red-400" title="Circuit Breaker Tripped" /> :
                                     agent.health < agentHealthThreshold && <AlertTriangle size={16} className="text-yellow-400" title="Low Health" />
                                    }
                                </div>
                                <div className={`${getHealthColor(agent.health, agent.status)} font-bold text-lg`}>{agent.health.toFixed(0)}%</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs mb-3 text-slate-400">
                                <div><span className="text-slate-500">Latency:</span> {agent.latency}ms</div>
                                <div><span className="text-slate-500">Trades:</span> {agent.trades}</div>
                                <div><span className="text-slate-500">Accuracy:</span> {agent.accuracy}%</div>
                            </div>
                             <div className="space-y-2">
                                <div title={`Workload: ${agent.workload}%`}>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div className="bg-cyan-500 h-1.5 rounded-full" style={{width: `${agent.workload}%`}}></div>
                                    </div>
                                </div>
                                <div title={`Health: ${agent.health}%`}>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div className={`${getHealthBgColor(agent.health, agent.status)} h-1.5 rounded-full`} style={{width: `${agent.health}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getPriorityColor(agent.priority)}`}>
                                    {agent.priority} Priority
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                               <span className={`capitalize font-bold ${getHealthColor(agent.health, agent.status)}`}>{agent.status}</span>
                               <div 
                                   className={`relative inline-block w-10 h-5 rounded-full ${agent.status === 'error' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                   onClick={(e) => agent.status !== 'error' && handleToggleStatus(e, agent.id)}
                                   title={agent.status === 'error' ? 'Agent circuit breaker tripped' : `Set agent to ${agent.status === 'active' ? 'paused' : 'active'}`}
                                >
                                  <input type="checkbox" checked={agent.status === 'active'} readOnly disabled={agent.status === 'error'} className="absolute w-full h-full opacity-0"/>
                                  <div className={`block h-5 rounded-full ${
                                      agent.status === 'error' ? 'bg-red-800' :
                                      agent.status === 'active' ? 'bg-green-500/50' : 'bg-slate-600'
                                  }`}></div>
                                  <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                                      agent.status === 'active' ? 'translate-x-5' : ''
                                  } ${agent.status === 'error' ? 'bg-slate-400' : 'bg-white'}`}></div>
                               </div>
                            </div>
                        </div>
                    </div>
                ))}
                 {filteredAgents.length === 0 && (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-slate-500">
                        <p>No agents match the current filters.</p>
                    </div>
                 )}
            </div>
            {selectedAgent && (
                <AgentDetailModal 
                    agent={selectedAgent} 
                    onClose={() => setSelectedAgent(null)} 
                />
            )}
        </div>
    );
};

export default Agents;