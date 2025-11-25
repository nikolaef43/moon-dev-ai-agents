import React from 'react';
import { SystemState } from '../types';
// fix: Corrected import for AIConsole. It's exported as DeprecatedAIConsole from ModeSelector.
import { DeprecatedAIConsole as AIConsole } from './ModeSelector';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export const DeprecatedDashboard: React.FC<{ systemState: SystemState; onSend: Function }> = ({ systemState, onSend }) => {
    const activeAgents = systemState.agents.filter(a => a.status === 'active').length;
    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Today's P&L" value={`$${systemState.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color={systemState.pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
                <StatCard title="Active Agents" value={`${activeAgents} / ${systemState.agents.length}`} color="text-white" />
                <StatCard title="Max Drawdown" value={`${(systemState.drawdown * 100).toFixed(2)}%`} color="text-yellow-400" />
            </div>
            
            <div className="flex-grow flex flex-col md:flex-row gap-6 h-[calc(100%-120px)]">
                <div className="w-full md:w-1/2 h-64 md:h-full bg-gray-800/50 p-4 rounded-lg flex flex-col">
                     <h3 className="text-lg font-semibold text-gray-200 mb-4">P&L Performance (3H)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={systemState.pnlHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                                labelStyle={{ color: '#F9FAFB' }}
                            />
                            <Area type="monotone" dataKey="pnl" stroke="#38BDF8" fill="url(#colorPnl)" />
                             <defs>
                                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 h-full flex flex-col">
                    <AIConsole systemState={systemState} onSend={onSend} />
                </div>
            </div>
        </div>
    );
};