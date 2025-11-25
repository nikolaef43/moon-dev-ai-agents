import React from 'react';
import { Agent, AgentStatus } from '../types';

const statusColorMap: Record<AgentStatus, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    monitoring: 'bg-blue-500',
    error: 'bg-red-500',
};

const AgentRow: React.FC<{ agent: Agent }> = ({ agent }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors duration-150">
        <td className="px-4 py-3 text-sm text-gray-200">{agent.id}</td>
        <td className="px-4 py-3 text-sm">
             <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${statusColorMap[agent.status]}`}></span>
                <span className="text-gray-300 capitalize">{agent.status}</span>
            </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-400">{agent.strategy}</td>
        <td className="px-4 py-3 text-sm text-gray-400">{agent.symbols.join(', ')}</td>
        <td className={`px-4 py-3 text-sm font-medium ${agent.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {agent.pnl >= 0 ? '+' : '-'}${Math.abs(agent.pnl).toLocaleString()}
        </td>
        <td className="px-4 py-3 text-sm text-gray-300 text-center">{agent.trades}</td>
    </tr>
);


export const DeprecatedAgents: React.FC<{ agents: Agent[] }> = ({ agents }) => {
    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Agent Swarm Status</h1>
            <div className="flex-grow overflow-y-auto bg-gray-800/50 rounded-lg">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-gray-900">
                        <tr className="border-b border-gray-600">
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Agent ID</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Strategy</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Symbols</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">24H P&L</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Trades</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map(agent => <AgentRow key={agent.id} agent={agent} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};