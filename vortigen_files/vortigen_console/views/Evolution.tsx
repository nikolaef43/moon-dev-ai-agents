import React from 'react';
import { EvolutionaryState, AuditLog } from '../types';
import { EvolutionIcon } from '../components/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg text-center">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
    </div>
);

const LastMutationCard: React.FC<{ mutation: EvolutionaryState['lastMutation'] }> = ({ mutation }) => {
    if (!mutation) {
        return (
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Last Mutation Details</h2>
                <p className="text-sm text-gray-400">No mutation events recorded in the current cycle. Awaiting performance analysis.</p>
            </div>
        );
    }
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Last Mutation Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-xs text-gray-400">Agent ID</p>
                    <p className="text-md font-mono text-white">{mutation.agentId}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Gene Mutated</p>
                    <p className="text-md font-mono text-white">{mutation.gene}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Value Change</p>
                    <p className="text-md font-mono text-white">{mutation.oldValue.toFixed(2)} → {mutation.newValue.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400">Reason</p>
                    <p className="text-md text-white capitalize">{mutation.reason}</p>
                </div>
            </div>
        </div>
    );
};

export const Evolution: React.FC<{ evolutionaryState: EvolutionaryState, auditLogs: AuditLog[] }> = ({ evolutionaryState, auditLogs }) => {
    const evolutionLogs = auditLogs.filter(log => log.level === 'EVOLUTION').slice(0, 10);
    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
            <div className="flex items-center gap-3">
                <EvolutionIcon className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">System Evolution & Genome Integrity</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Collective Fitness" value={evolutionaryState.currentFitness.toFixed(5)} />
                <StatCard title="Total Genome Mutations" value={evolutionaryState.mutations.toLocaleString()} />
            </div>

            <LastMutationCard mutation={evolutionaryState.lastMutation} />

            <div className="flex-grow h-96 bg-gray-800/50 p-4 rounded-lg flex flex-col border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Genome Fitness Over Time (5H)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolutionaryState.history} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                            dataKey="timestamp" 
                            stroke="#9CA3AF" 
                            fontSize={12} 
                            tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        />
                        <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={12} 
                            domain={['dataMin - 0.005', 'dataMax + 0.005']}
                            tickFormatter={(val) => val.toFixed(3)}
                         />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                            labelStyle={{ color: '#F9FAFB' }}
                            formatter={(value: number) => [value.toFixed(5), 'Fitness']}
                        />
                        <Area type="monotone" dataKey="fitness" stroke="#A78BFA" fill="url(#colorFitness)" />
                         <defs>
                            <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Live Mutation Feed</h2>
                <div className="font-mono text-xs text-green-400 bg-black/30 p-4 rounded-md h-48 overflow-y-auto space-y-2">
                    {evolutionLogs.length > 0 ? evolutionLogs.map(log => (
                        <p key={log.id}>
                            <span className="text-gray-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}></span>
                            <span className="text-purple-400">[EVOLUTION]</span>
                            <span className="text-gray-300 ml-2">{log.message}</span>
                        </p>
                    )) : (
                        <p className="text-gray-500">> No recent evolutionary events. System is stable.</p>
                    )}
                </div>
            </div>

        </div>
    );
};