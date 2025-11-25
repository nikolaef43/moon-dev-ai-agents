

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TerminalSquare, Send, Search, Users, Cpu, Loader, Power, Filter, XCircle, AlertTriangle, Trash2, TrendingUp, TrendingDown, X, BrainCircuit, FileText, Settings, Shield } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AiAgent, AgentCommand as AgentCommandType, TaskType, BoardConsultation } from '../../types';
import { getAgentDefinition, getAgentsWithCapability } from '../../core/agentRegistry';
import { getAgentCommandResponse } from '../../services/geminiService';


interface TradeExecutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (symbol: string, quantity: number) => void;
    action: 'buy' | 'sell';
}

const TradeExecutionModal: React.FC<TradeExecutionModalProps> = ({ isOpen, onClose, onConfirm, action }) => {
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSymbol('');
            setQuantity('');
        }
    }, [isOpen]);
    
    if (!isOpen) return null;

    const isBuy = action === 'buy';
    const canConfirm = symbol.trim() !== '' && Number(quantity) > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (canConfirm) {
            onConfirm(symbol.toUpperCase(), Number(quantity));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-800">
                        <h2 className={`text-xl font-bold flex items-center gap-3 ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                            {isBuy ? <TrendingUp /> : <TrendingDown />}
                            Execute {isBuy ? 'Buy' : 'Sell'} Order
                        </h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="symbol" className="block text-sm font-medium text-slate-300 mb-1">
                                Symbol / Ticker
                            </label>
                            <input
                                id="symbol"
                                type="text"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                placeholder="e.g., AAPL, BTC/USDT"
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none uppercase"
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                             <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-1">
                                Quantity
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g., 100"
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800/50 px-6 py-3 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={!canConfirm}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed ${isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            Confirm {isBuy ? 'Buy' : 'Sell'} Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface BoardConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskType: string, query: string) => void;
}

const taskTypes: { id: TaskType; label: string; icon: React.ElementType }[] = [
    { id: 'TRADE_ADVICE', label: 'Trade Advice', icon: TrendingUp },
    { id: 'EXECUTION_ADVICE', label: 'Execution Advice', icon: Settings },
    { id: 'REASONING', label: 'General Reasoning', icon: BrainCircuit },
    { id: 'LONG_CONTEXT', label: 'Long-Context Analysis', icon: FileText },
    { id: 'SAFETY', label: 'Safety/Compliance Check', icon: Shield },
];

const BoardConsultationModal: React.FC<BoardConsultationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [taskType, setTaskType] = useState<string>('TRADE_ADVICE');
    const [query, setQuery] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSubmit(taskType, query);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-800">
                        <h2 className="text-xl font-bold flex items-center gap-3">Consult AI Board</h2>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="taskType" className="block text-sm font-medium text-slate-300 mb-1">Task Type</label>
                            <select id="taskType" value={taskType} onChange={e => setTaskType(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                                {taskTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="query" className="block text-sm font-medium text-slate-300 mb-1">Request / Query</label>
                            <textarea id="query" value={query} onChange={e => setQuery(e.target.value)} rows={4} placeholder="e.g., 'Analyze the risk of a long position in NVDA given current volatility.'" className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" required />
                        </div>
                    </div>
                    <div className="bg-slate-800/50 px-6 py-3 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600">Cancel</button>
                        <button type="submit" disabled={!query.trim()} className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50">Submit Consultation</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const StructuredResponse: React.FC<{ content: string }> = ({ content }) => {
    try {
        const data = JSON.parse(content);

        if (data.error) {
            return <p className="text-red-400 whitespace-pre-wrap">Error: {data.error}</p>;
        }

        return (
            <div className="space-y-2">
                <p className="whitespace-pre-wrap">{data.text_content}</p>
                <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-700/50 text-slate-400">
                    <span>Type: <span className="font-semibold text-slate-300 capitalize font-mono">{data.response_type?.replace('_', ' ')}</span></span>
                    {data.requires_confirmation && (
                        <span className="flex items-center gap-1 font-semibold text-yellow-400">
                            <AlertTriangle size={14} />
                            Confirmation Required
                        </span>
                    )}
                </div>
            </div>
        );
    } catch (e) {
        // Fallback for non-JSON content or parsing errors
        return <p className="whitespace-pre-wrap">{content}</p>;
    }
};

const AgentList: React.FC<{
    agents: AiAgent[];
    selectedAgent: AiAgent | null;
    onSelectAgent: (agent: AiAgent) => void;
}> = ({ agents, selectedAgent, onSelectAgent }) => {
    
    const { state, dispatch } = useAppContext();
    const { agentFilter, agentHealthThreshold } = state;
    const { query, lowHealthOnly } = agentFilter;
    
    const commandableAgents = useMemo(() => {
        const commandableNames = getAgentsWithCapability('commandable').map(a => a.name);
        return agents.filter(agent => commandableNames.includes(agent.name));
    }, [agents]);

    const filteredAgents = useMemo(() => {
        return commandableAgents.filter(agent => {
            const matchesSearch = agent.name.toLowerCase().includes(query.toLowerCase());
            const matchesHealth = !lowHealthOnly || agent.health < agentHealthThreshold || agent.status === 'error';
            return matchesSearch && matchesHealth;
        });
    }, [commandableAgents, query, lowHealthOnly, agentHealthThreshold]);

    const isFilterActive = query || lowHealthOnly;

    const handleToggleStatus = (e: React.MouseEvent, agentId: string) => {
        e.stopPropagation();
        dispatch({ type: 'TOGGLE_AGENT_STATUS', payload: { agentId } });
    };

    return (
        <div className="bg-slate-900 border-r border-slate-800 flex flex-col w-1/3 max-w-sm">
            <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search commandable agents..."
                        value={query}
                        onChange={(e) => dispatch({ type: 'SET_AGENT_FILTER', payload: { query: e.target.value } })}
                        className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>
                 <div className="flex items-center gap-2">
                    <button
                        onClick={() => dispatch({ type: 'SET_AGENT_FILTER', payload: { lowHealthOnly: !lowHealthOnly } })}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors w-full justify-center ${
                            lowHealthOnly
                                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        <Filter size={12}/>
                        Show Low Health
                    </button>
                    {isFilterActive && (
                        <button onClick={() => dispatch({ type: 'SET_AGENT_FILTER', payload: { query: '', lowHealthOnly: false } })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                            <XCircle size={12}/>
                            Clear
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredAgents.map(agent => (
                    <div
                        key={agent.name}
                        onClick={() => onSelectAgent(agent)}
                        className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${selectedAgent?.name === agent.name ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                                agent.status === 'error' ? 'bg-red-500' :
                                agent.status === 'paused' ? 'bg-slate-500' : 
                                (agent.health >= agentHealthThreshold ? 'bg-green-500' : 'bg-yellow-500')
                            }`} title={`Health: ${agent.health}%`}></div>
                            <div>
                                <div className="font-bold flex items-center gap-1.5">
                                    {agent.name}
                                    {agent.status === 'error' ? <AlertTriangle size={14} className="text-red-400" /> :
                                     agent.health < agentHealthThreshold && <AlertTriangle size={14} className="text-yellow-400" />
                                    }
                                </div>
                                <div className="text-xs text-slate-400">{agent.health.toFixed(0)}% Health</div>
                            </div>
                        </div>
                        <div 
                            className={`relative inline-block w-10 h-5 rounded-full ${agent.status === 'error' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={(e) => agent.status !== 'error' && handleToggleStatus(e, agent.id)}
                            title={agent.status === 'error' ? 'Circuit breaker tripped' : `Status: ${agent.status}. Click to toggle.`}
                        >
                           <input type="checkbox" checked={agent.status === 'active'} readOnly disabled={agent.status === 'error'} className="absolute w-full h-full opacity-0"/>
                           <div className={`block h-5 rounded-full ${agent.status === 'error' ? 'bg-red-800' : agent.status === 'active' ? 'bg-green-500/50' : 'bg-slate-600'}`}></div>
                           <div className={`dot absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-transform ${agent.status === 'active' ? 'translate-x-5' : ''} ${agent.status === 'error' ? 'bg-slate-400' : 'bg-white'}`}></div>
                        </div>
                    </div>
                ))}
                 {filteredAgents.length === 0 && (
                    <div className="text-center p-8 text-slate-500 text-sm">
                        <p>No agents match filters.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

const AgentTerminal: React.FC<{ agent: AiAgent }> = ({ agent }) => {
    const { state, dispatch } = useAppContext();
    const [command, setCommand] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
    const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const agentDefinition = getAgentDefinition(agent.name);
    const commandHistory = state.agentCommands[agent.name] || [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [commandHistory]);

    const handleSubmit = async (e: React.FormEvent, explicitCommand?: string) => {
        e.preventDefault();
        const commandToSend = explicitCommand || command;
        if (!commandToSend.trim() || isProcessing) return;

        if (agent.status === 'error') {
            if (window.confirm(`Agent '${agent.name}' has a tripped circuit breaker. Would you like to reset it now?`)) {
                dispatch({ type: 'RESET_AGENT_CIRCUIT_BREAKER', payload: { agentId: agent.id } });
            }
            return;
        }

        if (agent.status !== 'active') return;

        setIsProcessing(true);
        const userCommandId = Date.now();
        const userCommand: AgentCommandType = {
            id: userCommandId,
            role: 'user',
            content: commandToSend,
            timestamp: new Date().toISOString()
        };
        dispatch({ type: 'ADD_AGENT_COMMAND', payload: { agentName: agent.name, command: userCommand } });
        
        if (!explicitCommand) {
            setCommand('');
        }

        const processingResponseId = userCommandId + 1;
        const processingResponse: AgentCommandType = {
            id: processingResponseId,
            role: 'agent',
            content: '',
            timestamp: new Date().toISOString(),
            isProcessing: true,
        };
        dispatch({ type: 'ADD_AGENT_COMMAND', payload: { agentName: agent.name, command: processingResponse } });

        const responseContent = await getAgentCommandResponse(agent.name, commandToSend, commandHistory);
        
        dispatch({ 
            type: 'UPDATE_AGENT_COMMAND', 
            payload: { 
                agentName: agent.name, 
                commandId: processingResponseId,
                updates: { content: responseContent || JSON.stringify({ error: "No response received." }) }
            } 
        });
        setIsProcessing(false);
    };
    
    const handleClearHistory = () => {
        if (window.confirm(`Are you sure you want to clear the command history for ${agent.name}?`)) {
            dispatch({ type: 'CLEAR_AGENT_COMMAND_HISTORY', payload: { agentName: agent.name } });
        }
    };

    const handleOpenTradeModal = (action: 'buy' | 'sell') => {
        setTradeAction(action);
        setIsTradeModalOpen(true);
    };

    const handleConfirmTrade = (symbol: string, quantity: number) => {
        const tradeCommand = `${tradeAction.toUpperCase()} ${quantity} ${symbol}`;
        setIsTradeModalOpen(false);
        const mockEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(mockEvent, tradeCommand);
    };

    const handleConsultBoard = (taskType: string, query: string) => {
        const consultation: Omit<BoardConsultation, 'status'|'advice'> = {
            id: Date.now(),
            agentName: agent.name,
            request: query,
            taskType: taskType as TaskType,
            timestamp: new Date().toISOString()
        };
        dispatch({ type: 'START_BOARD_CONSULTATION', payload: consultation });
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'aiBoard' });
        setIsConsultationModalOpen(false);
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-950">
            {isTradeModalOpen && (
                <TradeExecutionModal
                    isOpen={isTradeModalOpen}
                    onClose={() => setIsTradeModalOpen(false)}
                    onConfirm={handleConfirmTrade}
                    action={tradeAction}
                />
            )}
            {isConsultationModalOpen && <BoardConsultationModal isOpen={isConsultationModalOpen} onClose={() => setIsConsultationModalOpen(false)} onSubmit={handleConsultBoard} />}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Cpu size={20} className="text-purple-400" />
                    <h3 className="text-lg font-bold">{agent.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        agent.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        agent.status === 'paused' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                    }`}>{agent.status}</span>
                </div>
                <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded-lg hover:text-red-400 transition-colors"
                    title="Clear command history"
                >
                    <Trash2 size={14} />
                    Clear
                </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0"><Power size={16} /></div>
                    <div className="bg-slate-800 p-3 rounded-lg text-sm text-slate-300">
                        {agentDefinition?.welcomeMessage || `${agent.name} online. Awaiting commands.`}
                    </div>
                </div>

                {commandHistory.map((cmd) => (
                    <div key={cmd.id} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cmd.role === 'user' ? 'bg-slate-700' : 'bg-gradient-to-br from-cyan-500 to-blue-600'}`}>
                           {cmd.role === 'user' ? <Users size={16} /> : <Cpu size={16} />}
                        </div>
                         <div className={`p-3 rounded-lg text-sm flex-1 ${cmd.role === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-300'}`}>
                           {cmd.isProcessing ? (
                               <div className="flex items-center gap-2 text-slate-400">
                                   <Loader size={14} className="animate-spin" /> Processing...
                               </div>
                           ) : (
                                cmd.role === 'user' 
                                ? <p className="whitespace-pre-wrap">{cmd.content}</p> 
                                : <StructuredResponse content={cmd.content} />
                           )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => handleOpenTradeModal('buy')}
                        disabled={isProcessing || agent.status !== 'active'}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-sm disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Buy
                    </button>
                    <button
                        onClick={() => handleOpenTradeModal('sell')}
                        disabled={isProcessing || agent.status !== 'active'}
                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Sell
                    </button>
                    <button
                        onClick={() => setIsConsultationModalOpen(true)}
                        disabled={isProcessing || agent.status !== 'active'}
                        className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-sm disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Consult AI Board
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder={
                            agent.status === 'error' ? `Agent tripped. Press Send to see reset options.` :
                            agent.status === 'paused' ? `Agent is paused. Resume to send commands.` : 
                            `Send command to ${agent.name}...`
                        }
                        disabled={isProcessing || (agent.status !== 'active' && agent.status !== 'error')}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                    />
                    <button type="submit" disabled={isProcessing || (agent.status !== 'active' && agent.status !== 'error')} className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:bg-slate-700 disabled:cursor-not-allowed">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

const AgentCommand: React.FC = () => {
    const { state } = useAppContext();
    const { aiAgents } = state;
    const [selectedAgent, setSelectedAgent] = useState<AiAgent | null>(null);
    
    useEffect(() => {
        const firstCommandableName = getAgentsWithCapability('commandable')[0]?.name;
        if (firstCommandableName) {
            const agentState = aiAgents.find(a => a.name === firstCommandableName);
            if(agentState) setSelectedAgent(agentState);
        }
    }, [aiAgents]);

    useEffect(() => {
        // Keep selected agent state in sync if it gets updated globally (e.g., health change)
        if (selectedAgent) {
            const updatedAgent = aiAgents.find(a => a.id === selectedAgent.id);
            if (updatedAgent) {
                setSelectedAgent(updatedAgent);
            }
        }
    }, [aiAgents, selectedAgent]);

    return (
        <div className="h-full flex flex-col">
             <h2 className="text-3xl font-bold flex items-center gap-3 mb-6 px-8 pt-8 -ml-8 -mt-8 pb-6 bg-slate-900 border-b border-slate-800">
                <TerminalSquare size={28} className="text-cyan-400" />
                Agent Command Processor
            </h2>
            <div className="flex-1 flex overflow-hidden -mx-8 -mb-8">
                <AgentList
                    agents={aiAgents}
                    selectedAgent={selectedAgent}
                    onSelectAgent={setSelectedAgent}
                />
                {selectedAgent ? (
                    <AgentTerminal agent={selectedAgent} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        <p>Select a commandable agent from the list to begin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentCommand;