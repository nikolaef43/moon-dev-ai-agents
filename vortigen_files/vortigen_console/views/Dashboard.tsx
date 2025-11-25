import React from 'react';
import { SystemState } from '../types';
import { AIConsole } from '../components/AIConsole';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CollectiveIcon, EvolutionIcon } from '../components/icons';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
    </div>
);

const CollectiveIntelligenceCard: React.FC<{ collectiveState: SystemState['collectiveState'] }> = ({ collectiveState }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-3 mb-2">
            <CollectiveIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-400">Collective Intelligence</h3>
        </div>
        <p className="text-lg font-bold text-white mb-2 truncate">{collectiveState.sentiment}</p>
        <p className="text-xs text-gray-300 line-clamp-1">Focus: <span className="font-semibold text-blue-300">{collectiveState.operationalFocus}</span></p>
    </div>
);

const EvolutionCard: React.FC<{ evolutionaryState: SystemState['evolutionaryState'] }> = ({ evolutionaryState }) => (
     <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-3 mb-2">
            <EvolutionIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-400">System Evolution</h3>
        </div>
        <p className="text-lg font-bold text-white mb-2">Fitness: {evolutionaryState.currentFitness.toFixed(4)}</p>
        <p className="text-xs text-gray-300">Mutations: <span className="font-semibold text-purple-300">{evolutionaryState.mutations}</span></p>
    </div>
);

export const Dashboard: React.FC<{ systemState: SystemState; onSend: Function }> = ({ systemState, onSend }) => {
    const activeAgents = systemState.agents.filter(a => a.status === 'active').length;
    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
                <StatCard title="Today's P&L" value={`$${systemState.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color={systemState.pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
                <StatCard title="Active Agents" value={`${activeAgents} / ${systemState.agents.length}`} color="text-white" />
                <EvolutionCard evolutionaryState={systemState.evolutionaryState} />
                <CollectiveIntelligenceCard collectiveState={systemState.collectiveState} />
            </div>
            
            <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-0">
                <div className="w-full md:w-1/2 h-64 md:h-full bg-gray-800/50 p-4 rounded-lg flex flex-col border border-gray-700">
                     <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        P&L Performance (3H)
                     </h3>
                    <div className="flex-grow min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={systemState.pnlHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#6B7280" fontSize={10} tickMargin={8} />
                                <YAxis stroke="#6B7280" fontSize={10} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.375rem' }}
                                    labelStyle={{ color: '#9CA3AF', fontSize: '12px' }}
                                    itemStyle={{ color: '#38BDF8', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="pnl" stroke="#38BDF8" strokeWidth={2} fill="url(#colorPnl)" />
                                <defs>
                                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="w-full md:w-1/2 h-full flex flex-col min-h-0">
                    <AIConsole systemState={systemState} onSend={onSend} />
                </div>
            </div>
        </div>
    );
};