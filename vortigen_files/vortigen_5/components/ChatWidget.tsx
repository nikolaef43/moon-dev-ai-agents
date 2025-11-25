
import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, BrainCircuit, Send, X, Loader, Globe, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getChatResponseStream } from '../services/geminiService';
import { ChatMessageSource, TaskType, BoardAdvice } from '../types';
import StructuredAdviceCard from './StructuredAdviceCard';

const taskTypes: { id: TaskType; label: string }[] = [
    { id: 'TRADE_ADVICE', label: 'Trade Advice' },
    { id: 'EXECUTION_ADVICE', label: 'Execution Advice' },
    { id: 'REASONING', label: 'General Reasoning' },
    { id: 'LONG_CONTEXT', label: 'Long-Context Analysis' },
    { id: 'SAFETY', label: 'Safety/Compliance Check' },
];

const BoardAdviceMessage: React.FC<{ advice: BoardAdvice[] }> = ({ advice }) => {
    if (!advice || advice.length === 0) return null;
    return (
        <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-2">
            <h4 className="text-xs font-bold text-slate-400">Board Consultation Response:</h4>
            <StructuredAdviceCard advice={advice[0]} isMinimized />
        </div>
    );
};

const ChatWidget: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { chatHistory } = state;
    const [input, setInput] = useState('');
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const [isWebSearchMode, setIsWebSearchMode] = useState(false);
    const [isBoardConsultationMode, setIsBoardConsultationMode] = useState(false);
    const [consultationTaskType, setConsultationTaskType] = useState<TaskType>('TRADE_ADVICE');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatHistory]);
    
    useEffect(() => {
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (isLoading && lastMessage && lastMessage.role === 'model' && !lastMessage.isThinking) {
            setIsLoading(false);
        }
    }, [chatHistory, isLoading]);

    const handleThinkingModeToggle = () => {
        const newMode = !isThinkingMode;
        setIsThinkingMode(newMode);
        if (newMode) {
            setIsWebSearchMode(false);
            setIsBoardConsultationMode(false);
        }
    };

    const handleWebSearchModeToggle = () => {
        const newMode = !isWebSearchMode;
        setIsWebSearchMode(newMode);
        if (newMode) {
            setIsThinkingMode(false);
            setIsBoardConsultationMode(false);
        }
    };
    
    const handleBoardConsultationToggle = () => {
        const newMode = !isBoardConsultationMode;
        setIsBoardConsultationMode(newMode);
        if (newMode) {
            setIsThinkingMode(false);
            setIsWebSearchMode(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user' as const, content: input };
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
        
        setIsLoading(true);

        if (isBoardConsultationMode) {
            const consultationId = Date.now();
            const modelMessage = {
                role: 'model' as const,
                content: `Consulting the AI Board about "${input}"...`,
                isBoardConsultation: true,
                isThinking: true,
                consultationId: consultationId,
            };
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: modelMessage });

            dispatch({
                type: 'START_BOARD_CONSULTATION',
                payload: {
                    id: consultationId,
                    agentName: 'VORTIGEN UI',
                    request: input,
                    taskType: consultationTaskType,
                    timestamp: new Date().toISOString(),
                }
            });
            setIsBoardConsultationMode(false);
        } else {
            const modelMessage = { 
                role: 'model' as const, 
                content: '', 
                isThinking: isThinkingMode,
                isSearching: isWebSearchMode 
            };
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: modelMessage });

            const fullHistory = [...chatHistory, userMessage];

            try {
                await getChatResponseStream(fullHistory, isThinkingMode, isWebSearchMode, (update) => {
                     dispatch({ type: 'UPDATE_LAST_CHAT_MESSAGE', payload: update });
                });
            } finally {
                setIsLoading(false);
            }
        }
        setInput('');
    };

    const renderSources = (sources: ChatMessageSource[]) => (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-400 mb-1">Sources:</h4>
            <div className="flex flex-col gap-1">
                {sources.map((source, i) => (
                    <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline truncate"
                    >
                        {i+1}. {source.title}
                    </a>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-24 right-8 w-96 h-[520px] max-h-[calc(100vh-10rem)] bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl z-40 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Bot className="text-cyan-400" />
                    <h3 className="font-bold">VORTIGEN Assistant</h3>
                </div>
                <button onClick={() => dispatch({ type: 'TOGGLE_CHAT' })} className="text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0"><Bot size={18} /></div>}
                            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-slate-700' : 'bg-slate-800'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                {msg.isThinking && !msg.isBoardConsultation && msg.isThinking && <div className="text-xs text-purple-400 mt-2 flex items-center gap-1"><BrainCircuit size={12}/> Thinking Mode</div>}
                                {msg.isThinking && msg.isBoardConsultation && <div className="text-xs text-cyan-400 mt-2 flex items-center gap-1"><Users size={12}/> Consulting Board...</div>}
                                {msg.isSearching && <div className="text-xs text-cyan-400 mt-2 flex items-center gap-1"><Globe size={12}/> Searching web...</div>}
                                {msg.sources && renderSources(msg.sources)}
                                {msg.boardAdvice && <BoardAdviceMessage advice={msg.boardAdvice} />}
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0"><User size={18} /></div>}
                        </div>
                    ))}
                    {isLoading && chatHistory[chatHistory.length - 1]?.role === 'model' && (
                         <div className="flex justify-start">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0"><Loader size={18} className="animate-spin" /></div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <footer className="p-4 border-t border-slate-700">
                <div className="flex items-center justify-around mb-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                        <BrainCircuit size={14} className={isThinkingMode ? 'text-purple-400' : ''} />
                        <span className={isThinkingMode ? 'font-bold text-purple-400' : ''}>Thinking</span>
                        <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer ml-1" onClick={handleThinkingModeToggle}>
                           <input type="checkbox" checked={isThinkingMode} readOnly className="absolute w-full h-full opacity-0"/>
                           <div className={`block h-4 rounded-full ${isThinkingMode ? 'bg-purple-500/50' : 'bg-slate-600'}`}></div>
                           <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${isThinkingMode ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                     <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                        <Globe size={14} className={isWebSearchMode ? 'text-cyan-400' : ''} />
                        <span className={isWebSearchMode ? 'font-bold text-cyan-400' : ''}>Web</span>
                        <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer ml-1" onClick={handleWebSearchModeToggle}>
                           <input type="checkbox" checked={isWebSearchMode} readOnly className="absolute w-full h-full opacity-0"/>
                           <div className={`block h-4 rounded-full ${isWebSearchMode ? 'bg-cyan-500/50' : 'bg-slate-600'}`}></div>
                           <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${isWebSearchMode ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                     <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                        <Users size={14} className={isBoardConsultationMode ? 'text-cyan-400' : ''} />
                        <span className={isBoardConsultationMode ? 'font-bold text-cyan-400' : ''}>Board</span>
                        <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer ml-1" onClick={handleBoardConsultationToggle}>
                           <input type="checkbox" checked={isBoardConsultationMode} readOnly className="absolute w-full h-full opacity-0"/>
                           <div className={`block h-4 rounded-full ${isBoardConsultationMode ? 'bg-cyan-500/50' : 'bg-slate-600'}`}></div>
                           <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${isBoardConsultationMode ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                </div>
                {isBoardConsultationMode && (
                    <div className="mb-3">
                        <select
                            value={consultationTaskType}
                            onChange={(e) => setConsultationTaskType(e.target.value as TaskType)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        >
                            {taskTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isBoardConsultationMode ? "Query for the AI Board..." : "Ask anything..."}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <button type="submit" disabled={isLoading} className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50">
                        <Send size={18} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatWidget;
