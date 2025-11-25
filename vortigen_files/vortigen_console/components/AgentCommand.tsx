import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { SendIcon } from './icons';

interface AgentCommandProps {
    agent: Agent;
    onCommand: (agentId: string, side: 'Buy' | 'Sell', symbol: string, quantity: number) => void;
}

export const AgentCommand: React.FC<AgentCommandProps> = ({ agent, onCommand }) => {
    const [symbol, setSymbol] = useState(agent.symbols[0] || '');
    const [quantity, setQuantity] = useState('1.0');
    const [lastCommand, setLastCommand] = useState<string | null>(null);

    useEffect(() => {
        setSymbol(agent.symbols[0] || '');
        setQuantity('1.0');
        setLastCommand(null);
    }, [agent]);

    const handleCommand = (side: 'Buy' | 'Sell') => {
        const numQuantity = parseFloat(quantity);
        if (symbol && numQuantity > 0) {
            onCommand(agent.id, side, symbol, numQuantity);
            setLastCommand(`${side} ${numQuantity} ${symbol} @ market`);
            setTimeout(() => setLastCommand(null), 3000);
        }
    };
    
    return (
        <div className="h-full bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-1">Agent Command & Control</h2>
            <p className="text-sm text-gray-400 font-mono mb-4">Target: <span className="text-blue-400">{agent.id}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Symbol</label>
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {agent.symbols.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Quantity</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                         className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 flex-grow">
                <button
                    onClick={() => handleCommand('Buy')}
                    className="w-full h-full bg-green-600/80 text-white font-bold rounded-md transition-colors hover:bg-green-500 disabled:bg-gray-600"
                >
                    EXECUTE BUY
                </button>
                 <button
                    onClick={() => handleCommand('Sell')}
                    className="w-full h-full bg-red-600/80 text-white font-bold rounded-md transition-colors hover:bg-red-500 disabled:bg-gray-600"
                >
                    EXECUTE SELL
                </button>
            </div>
            <div className="mt-4 text-center h-5">
                {lastCommand && (
                    <p className="text-xs text-yellow-400 animate-pulse">
                        <SendIcon className="w-3 h-3 inline-block mr-1" />
                        Order transmitted: {lastCommand}
                    </p>
                )}
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Manual override actions are logged with CRITICAL priority.</p>
        </div>
    );
};
