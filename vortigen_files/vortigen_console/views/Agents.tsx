import React, { useState, useEffect } from 'react';
import { Agent, AgentStatus, AgentType, Strategy } from '../types';
import { AgentCommand } from '../components/AgentCommand';
import { SearchIcon } from '../components/icons';

const statusColorMap: Record<AgentStatus, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    monitoring: 'bg-blue-500',
    error: 'bg-red-500',
};

const typeStyleMap: Record<AgentType, { bg: string; text: string }> = {
    Agent: { bg: 'bg-purple-900/50', text: 'text-purple-300' },
    Bot: { bg: 'bg-blue-900/50', text: 'text-blue-300' },
};

const AgentRow: React.FC<{ agent: Agent, isSelected: boolean, onSelect: (id: string) => void }> = React.memo(({ agent, isSelected, onSelect }) => (
    <tr
      className={`border-b border-gray-700 transition-colors duration-150 cursor-pointer ${isSelected ? 'bg-blue-900/50' : 'hover:bg-gray-800/50'}`}
      onClick={() => onSelect(agent.id)}
    >
        <td className="px-4 py-3 text-sm text-gray-200 font-mono">{agent.id}</td>
        <td className="px-4 py-3 text-sm">
             <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${statusColorMap[agent.status]}`}></span>
                <span className="text-gray-300 capitalize">{agent.status}</span>
            </div>
        </td>
        <td className="px-4 py-3 text-sm">
            <div className={`px-2 py-1 rounded-full text-center text-xs font-semibold ${typeStyleMap[agent.type].bg} ${typeStyleMap[agent.type].text}`}>
                {agent.type}
            </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-400">{agent.strategy}</td>
        <td className="px-4 py-3 text-sm text-gray-400">{agent.collaboration || 'Solo Operation'}</td>
        <td className="px-4 py-3 text-sm text-gray-300 font-mono text-center">
            <div className="group relative">
                {agent.genomeVersion}
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-gray-900 text-left text-xs text-gray-300 rounded-md p-2 shadow-lg border border-gray-600 z-10">
                    <h4 className="font-bold mb-1">Agent Genes:</h4>
                    <pre className="text-xs">
                        {JSON.stringify(agent.genes, null, 2)}
                    </pre>
                </div>
            </div>
        </td>
        <td className={`px-4 py-3 text-sm font-medium text-center ${agent.fitnessScore > 1 ? 'text-green-400' : 'text-yellow-400'}`}>{agent.fitnessScore.toFixed(4)}</td>
        <td className={`px-4 py-3 text-sm font-medium text-right ${agent.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {agent.pnl >= 0 ? '+' : '-'}${Math.abs(agent.pnl).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </td>
    </tr>
));

const AgentConfiguration: React.FC<{ agent: Agent; onConfigure: (id: string, config: { risk_tolerance: number; adaptation_speed: number }) => void }> = ({ agent, onConfigure }) => {
    const [riskTolerance, setRiskTolerance] = useState(agent.genes.risk_tolerance);
    const [adaptationSpeed, setAdaptationSpeed] = useState(agent.genes.adaptation_speed);
    const [isDirty, setIsDirty] = useState(false);
    
    useEffect(() => {
        setRiskTolerance(agent.genes.risk_tolerance);
        setAdaptationSpeed(agent.genes.adaptation_speed);
        setIsDirty(false);
    }, [agent]);

    const handleSave = () => {
        onConfigure(agent.id, { risk_tolerance: riskTolerance, adaptation_speed: adaptationSpeed });
        setIsDirty(false);
    };
    
    const handleChangeRisk = (val: number) => {
        setRiskTolerance(val);
        setIsDirty(true);
    }
    
    const handleChangeAdaptation = (val: number) => {
        setAdaptationSpeed(val);
        setIsDirty(true);
    }

    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Agent Configuration</h3>
                {isDirty && <span className="text-xs text-yellow-400 italic">Unsaved changes</span>}
            </div>
            
            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Risk Tolerance</span>
                    <span className="text-blue-300 font-mono">{(riskTolerance * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={riskTolerance} 
                    onChange={(e) => handleChangeRisk(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>

            <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Adaptation Speed</span>
                    <span className="text-purple-300 font-mono">{(adaptationSpeed * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={adaptationSpeed} 
                    onChange={(e) => handleChangeAdaptation(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            <button 
                onClick={handleSave}
                disabled={!isDirty}
                className={`mt-1 w-full py-2 px-4 rounded text-xs font-bold transition-colors ${isDirty ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
            >
                Update Genes
            </button>
        </div>
    );
};

const AgentStrategyDetails: React.FC<{ agent: Agent; strategy?: Strategy }> = ({ agent, strategy }) => {
    if (!strategy) return null;

    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex flex-col gap-4 animate-fade-in h-full overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-700 pb-2">
                <div>
                     <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Strategy Intelligence</h3>
                     <p className="text-lg font-semibold text-white">{strategy.name}</p>
                </div>
                <div className="text-right">
                     <div className="text-xs text-gray-400">Edge vs Random</div>
                     <div className="text-lg font-bold text-green-400">+{strategy.edgeVsRandom.toFixed(2)}σ</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/30 p-3 rounded text-center">
                    <p className="text-xs text-gray-500">Win Rate</p>
                    <p className="text-xl font-bold text-white">{(strategy.winRate * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-gray-900/30 p-3 rounded text-center">
                    <p className="text-xs text-gray-500">Profit Factor</p>
                    <p className="text-xl font-bold text-blue-400">{strategy.profitFactor.toFixed(2)}</p>
                </div>
            </div>

            {strategy.parameters && (
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Strategy Parameters</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(strategy.parameters).map(([key, value]) => (
                            <div key={key} className="bg-gray-900/30 p-2 rounded border border-gray-700/50 flex justify-between items-center">
                                <span className="text-xs text-gray-400 truncate mr-2" title={key}>{key}</span>
                                <span className="text-xs font-mono text-blue-300 truncate max-w-[100px]" title={String(value)}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Available Toolkit (CLI/Scripts)</h4>
                 <div className="flex flex-wrap gap-2">
                    {agent.tools?.map(tool => (
                        <span key={tool} className="px-2 py-1 rounded-md bg-gray-900 border border-gray-600 text-xs text-gray-300 font-mono shadow-sm">
                            ./{tool}
                        </span>
                    )) || <span className="text-xs text-gray-500 italic">No local tools mapped.</span>}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Genetic Configuration (v{agent.genomeVersion})</h4>
                <div className="space-y-3">
                    {Object.entries(agent.genes).map(([key, value]) => (
                         <div key={key}>
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                <span>{((value as number) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div 
                                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (value as number) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-auto italic border-t border-gray-700 pt-2">
                Validation: {strategy.validation}
            </div>
        </div>
    );
};

export const Agents: React.FC<{ 
    agents: Agent[], 
    strategies: Strategy[], 
    onCommand: (agentId: string, side: 'Buy' | 'Sell', symbol: string, quantity: number) => void,
    onConfigure: (agentId: string, config: { risk_tolerance: number, adaptation_speed: number }) => void 
}> = ({ agents, strategies, onCommand, onConfigure }) => {
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents.length > 0 ? agents[0].id : null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAgents = agents.filter(agent => {
        const term = searchTerm.toLowerCase();
        return (
            agent.id.toLowerCase().includes(term) ||
            agent.status.toLowerCase().includes(term) ||
            agent.strategy.toLowerCase().includes(term) ||
            agent.symbols.some(s => s.toLowerCase().includes(term))
        );
    });
    
    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    const currentStrategy = selectedAgent ? strategies.find(s => s.name === selectedAgent.strategy) : undefined;

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
                 <h1 className="text-2xl font-bold text-white">
                    Agents & Bots ({filteredAgents.length !== agents.length ? `${filteredAgents.length}/` : ''}{agents.length} Cognitive Nodes)
                 </h1>
                 <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Filter by ID, status, strategy..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                    />
                    <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                 </div>
            </div>

            <div className="flex-[3] overflow-y-auto bg-gray-800/50 rounded-lg border border-gray-700">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                        <tr className="border-b border-gray-600">
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Agent ID</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Strategy</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Collaboration</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Genome Ver.</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Fitness</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">24H P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredAgents.map(agent => <AgentRow key={agent.id} agent={agent} isSelected={selectedAgentId === agent.id} onSelect={setSelectedAgentId} />)}
                         {filteredAgents.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 italic">
                                    No agents found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             <div className="flex-[2] flex flex-col gap-4 overflow-y-auto min-h-0">
                {selectedAgent ? (
                    <>
                        <div className="flex-shrink-0">
                            <AgentCommand agent={selectedAgent} onCommand={onCommand} />
                        </div>
                        <div className="flex-shrink-0">
                            <AgentConfiguration agent={selectedAgent} onConfigure={onConfigure} />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <AgentStrategyDetails agent={selectedAgent} strategy={currentStrategy} />
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                        <p className="text-gray-500">Select an agent from the table to issue commands.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
