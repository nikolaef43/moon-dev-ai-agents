import React, { useState, useMemo } from 'react';
import { Bot, Search, XCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AiBot } from '../../types';
import { getAgentDefinition } from '../../core/agentRegistry';

const BotCard: React.FC<{ bot: AiBot; onToggleStatus: (botId: string) => void }> = ({ bot, onToggleStatus }) => {
    const getStatusColor = (status: AiBot['status']): string => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'standby': return 'text-yellow-400';
            case 'error': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (bot.status !== 'error') {
            onToggleStatus(bot.id);
        }
    };
    
    return (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 flex flex-col h-full">
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-base flex items-center gap-2">
                            <Bot size={16} className={getStatusColor(bot.status)} />
                            {bot.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{bot.role}</p>
                    </div>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                    Parent: <span className="font-semibold text-slate-400">{bot.parent}</span>
                </span>
                <div className="flex items-center gap-2">
                     <span className={`capitalize font-bold ${getStatusColor(bot.status)}`}>
                        {bot.status}
                    </span>
                    <div 
                        className={`relative inline-block w-10 h-5 rounded-full ${bot.status === 'error' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={handleToggle}
                        title={bot.status === 'error' ? 'Bot has an error and cannot be toggled' : `Set bot to ${bot.status === 'active' ? 'standby' : 'active'}`}
                    >
                        <input type="checkbox" checked={bot.status === 'active'} readOnly disabled={bot.status === 'error'} className="absolute w-full h-full opacity-0"/>
                        <div className={`block h-5 rounded-full ${
                            bot.status === 'error' ? 'bg-red-800' :
                            bot.status === 'active' ? 'bg-green-500/50' : 'bg-slate-600'
                        }`}></div>
                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                            bot.status === 'active' ? 'translate-x-5' : ''
                        } ${bot.status === 'error' ? 'bg-slate-400' : 'bg-white'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Bots: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { aiBots } = state;
    const [filter, setFilter] = useState({ parent: 'all', status: 'all', search: '' });

    const filteredBots = useMemo(() => {
        return aiBots.filter(bot => {
            const agentDef = getAgentDefinition(bot.parent);
            const matchesParent = filter.parent === 'all' || (agentDef && agentDef.id === filter.parent);
            const matchesStatus = filter.status === 'all' || bot.status === filter.status;
            const matchesSearch = filter.search === '' ||
                bot.name.toLowerCase().includes(filter.search.toLowerCase()) ||
                bot.role.toLowerCase().includes(filter.search.toLowerCase());
            return matchesParent && matchesStatus && matchesSearch;
        });
    }, [aiBots, filter]);

    const parentAgents = useMemo(() => Array.from(new Set(aiBots.map(b => b.parent))).sort(), [aiBots]);

    const isFilterActive = filter.parent !== 'all' || filter.status !== 'all' || filter.search !== '';

    const handleToggleStatus = (botId: string) => {
        dispatch({ type: 'TOGGLE_BOT_STATUS', payload: { botId } });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3"><Bot size={28} className="text-cyan-400"/> Bot Fleet</h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search bots..."
                            value={filter.search}
                            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                            className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 w-52 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                     <select
                        value={filter.parent}
                        onChange={(e) => setFilter(f => ({...f, parent: e.target.value}))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="all">All Parent Agents</option>
                        {parentAgents.map(parentName => {
                            const agentDef = getAgentDefinition(parentName);
                            return <option key={agentDef?.id || parentName} value={agentDef?.id}>{parentName}</option>
                        })}
                    </select>
                     <select
                        value={filter.status}
                        onChange={(e) => setFilter(f => ({...f, status: e.target.value}))}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="standby">Standby</option>
                        <option value="error">Error</option>
                    </select>
                </div>
            </div>
            
            {isFilterActive && (
                <div className="mb-4">
                    <button onClick={() => setFilter({ parent: 'all', status: 'all', search: '' })} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700">
                        <XCircle size={12}/>
                        Clear Filters
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBots.map(bot => (
                    <BotCard key={bot.id} bot={bot} onToggleStatus={handleToggleStatus} />
                ))}
            </div>
            
             {filteredBots.length === 0 && (
                <div className="md:col-span-2 lg:col-span-4 text-center py-20 text-slate-500">
                    <p>No bots match the current filters.</p>
                </div>
             )}
        </div>
    );
};

export default Bots;
