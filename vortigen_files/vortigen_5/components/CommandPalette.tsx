import React, { useState, useEffect, useRef } from 'react';
import { Loader, Search, Bot } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getCommandFromGemini } from '../services/geminiService';
import { ActiveTab } from '../types';

const CommandPalette: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [command, setCommand] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus the input when the palette opens
        inputRef.current?.focus();

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
    };

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        setIsProcessing(true);
        const result = await getCommandFromGemini(command);
        setIsProcessing(false);
        setCommand('');
        handleClose();

        if (result?.functionCalls && result.functionCalls.length > 0) {
            const call = result.functionCalls[0];
            const args = call.args;

            switch(call.name) {
                case 'navigateTo':
                    if (args.tab) {
                        dispatch({ type: 'SET_ACTIVE_TAB', payload: args.tab as ActiveTab });
                        dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: `Navigating to ${args.tab}...`, type: 'info' } });
                    }
                    break;
                case 'filterAgents':
                    const agentFilter: { query?: string; lowHealthOnly?: boolean } = {};
                    if (args.name) agentFilter.query = args.name as string;
                    if (args.health_below) {
                        // This is a more complex filter that the UI doesn't directly support,
                        // so we translate it into something it does.
                        agentFilter.lowHealthOnly = true; 
                    }
                     if (args.show_low_health_only) {
                        agentFilter.lowHealthOnly = true;
                    }
                    dispatch({ type: 'SET_AGENT_FILTER', payload: agentFilter });
                    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'agents' });
                    break;
                case 'filterPositions':
                    if (args.symbol) {
                        dispatch({ type: 'SET_POSITION_FILTER', payload: { query: args.symbol as string } });
                        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'positions' });
                    }
                    break;
                case 'summarizePortfolio':
                    const summary = `Current portfolio value is $${state.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: summary, type: 'success' } });
                    break;
                default:
                    dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: "Sorry, I didn't understand that command.", type: 'error' } });
            }
        } else if (result?.text) {
             dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: result.text, type: 'info' } });
        } else {
             dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: "Could not process command.", type: 'error' } });
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24"
            onClick={handleClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleCommand}>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                           {isProcessing ? <Loader size={20} className="animate-spin" /> : <Search size={20} />}
                        </div>
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            placeholder="Issue a command to VORTIGEN... (e.g., 'navigate to risk hub')"
                            className="bg-transparent w-full text-lg pl-12 pr-4 py-4 focus:outline-none" 
                        />
                    </div>
                </form>
                <div className="border-t border-slate-800 p-4 text-xs text-slate-400 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Bot size={14} className="text-cyan-400" />
                        <span>Powered by Gemini Function Calling</span>
                    </div>
                     <div>Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-300 bg-slate-700 border border-slate-600 rounded">Esc</kbd> to close</div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
