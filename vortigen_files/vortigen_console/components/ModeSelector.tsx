import React, { useState, useRef, useEffect } from 'react';
import { AIMode, ChatMessage, SystemState } from '../types';
import { BoltIcon, BrainIcon, SearchIcon, SendIcon } from './icons';
import { DeprecatedAIMessage } from './Message';

const ModeSelector: React.FC<{ currentMode: AIMode; onModeChange: (mode: AIMode) => void; isLoading: boolean; }> = ({ currentMode, onModeChange, isLoading }) => {
  const modes = [
    { id: 'fast', label: 'Fast', icon: BoltIcon },
    { id: 'smart', label: 'Smart', icon: BrainIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
  ];
  return (
    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 space-x-1">
      {modes.map((mode) => (
        <button key={mode.id} onClick={() => onModeChange(mode.id as AIMode)} disabled={isLoading}
          className={`flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${currentMode === mode.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'} disabled:opacity-50`}>
          <mode.icon className="w-4 h-4" />
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export const DeprecatedAIConsole: React.FC<{ systemState: SystemState; onSend: Function }> = ({ systemState, onSend }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: 'VortigenOS AI Console online. How can I assist?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<AIMode>('fast');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: prompt };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setPrompt('');

      const response = await onSend(prompt, mode);
      
      const modelMessage: ChatMessage = {
        id: Date.now().toString() + 'm',
        role: 'model',
        text: response.text,
        sources: response.sources,
      };
      setMessages(prev => [...prev, modelMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg flex flex-col h-full">
      <h3 className="text-lg font-semibold text-gray-200 p-4 border-b border-gray-700">AI Console</h3>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => <DeprecatedAIMessage key={msg.id} message={msg} />)}
        {isLoading && (
            <div className="flex items-start gap-3 my-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center animate-pulse">
                    <div className="w-5 h-5 bg-blue-400/50 rounded-full"></div>
                </div>
                <div className="w-full p-4 rounded-lg bg-gray-800 text-gray-400">Thinking...</div>
            </div>
        )}
      </div>
      <div className="border-t border-gray-700 p-4">
        <div className="mb-2 flex justify-center md:justify-start">
            <ModeSelector currentMode={mode} onModeChange={setMode} isLoading={isLoading} />
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
            placeholder="Query system status..." rows={1}
            className="flex-1 bg-gray-700 text-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !prompt.trim()}
            className="w-12 h-12 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors hover:bg-blue-500 disabled:bg-gray-600">
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};