import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AIMode, ChatMessage, SystemState } from '../types';
import { BoltIcon, BrainIcon, SearchIcon, SendIcon, MicrophoneIcon, StopIcon } from './icons';
import { AIMessage } from './AIMessage';
import { useLiveSession } from '../hooks/useLiveSession';

const ModeSelector: React.FC<{ currentMode: AIMode; onModeChange: (mode: AIMode) => void; isLoading: boolean; isLive: boolean }> = ({ currentMode, onModeChange, isLoading, isLive }) => {
  const modes = [
    { id: 'fast', label: 'Fast', icon: BoltIcon },
    { id: 'smart', label: 'Smart', icon: BrainIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'live', label: 'Live', icon: MicrophoneIcon },
  ];
  return (
    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 space-x-1">
      {modes.map((mode) => (
        <button key={mode.id} onClick={() => onModeChange(mode.id as AIMode)} disabled={isLoading || (isLive && mode.id !== 'live')}
          className={`flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${currentMode === mode.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isLive && mode.id !== 'live' ? "Stop live session to change modes" : ""}
          >
          <mode.icon className="w-4 h-4" />
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export const AIConsole: React.FC<{ systemState: SystemState; onSend: Function }> = ({ systemState, onSend }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'system', text: 'VortigenOS v6.0 online. Causal inference engines active. Awaiting directive.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<AIMode>('fast');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptionRef = useRef('');

  const onTranscriptionUpdate = useCallback((isFinal: boolean, text: string) => {
      transcriptionRef.current = text;
      if (isFinal && text.trim()) {
           handleSend(new Event('submit'), text);
      } else {
          setPrompt(text); // Show live transcription in textarea
      }
  }, []);

  const { isSessionActive, start, stop } = useLiveSession(onTranscriptionUpdate);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, error]);
  
  const handleSend = async (e: React.FormEvent | Event, overridePrompt?: string) => {
    e.preventDefault();
    const currentPrompt = overridePrompt || prompt;
    
    if (currentPrompt.trim() && !isLoading) {
      setError(null);
      const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: currentPrompt };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setPrompt('');

      try {
        const response = await onSend(currentPrompt, mode);
        
        // Check for error in response text convention
        if (response.text && response.text.startsWith("An error occurred")) {
             setError(response.text);
        } else {
            const modelMessage: ChatMessage = {
                id: Date.now().toString() + 'm',
                role: 'model',
                text: response.text,
                sources: response.sources,
            };
            setMessages(prev => [...prev, modelMessage]);
        }
      } catch (err) {
          setError("System communication failure. Please verify network uplink.");
      } finally {
          setIsLoading(false);
      }
    }
  };

  const handleModeChange = (newMode: AIMode) => {
      if (isSessionActive) stop();
      setMode(newMode);
      setError(null);
      if (newMode === 'live') {
          start();
      }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg flex flex-col h-full border border-gray-700 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700 bg-gray-900/30 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-200">AI Console</h3>
        {isSessionActive && (
             <span className="flex items-center gap-2 px-2 py-1 rounded bg-red-900/30 border border-red-500/30 text-xs text-red-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                LIVE AUDIO
             </span>
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map(msg => <AIMessage key={msg.id} message={msg} />)}
        
        {isLoading && (
            <div className="flex items-start gap-3 my-4 animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center animate-pulse">
                    <div className="w-5 h-5 bg-blue-400/50 rounded-full"></div>
                </div>
                <div className="w-full p-4 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                    <span className="ml-2 text-sm font-mono">Processing causal chains...</span>
                </div>
            </div>
        )}

        {error && (
             <div className="flex items-start gap-3 my-4 animate-fade-in">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center">
                    <span className="text-red-400 font-bold">!</span>
                </div>
                <div className="w-full p-4 rounded-lg bg-red-900/20 border border-red-700/50 text-red-300 text-sm font-mono">
                    {error}
                </div>
             </div>
        )}
      </div>

      <div className="border-t border-gray-700 p-4 bg-gray-900/30">
        <div className="mb-3 flex justify-center md:justify-start">
            <ModeSelector currentMode={mode} onModeChange={handleModeChange} isLoading={isLoading} isLive={isSessionActive} />
        </div>
        
        {mode === 'live' ? (
             <div className="flex items-center gap-3 h-[52px] bg-gray-800/50 rounded-lg border border-gray-700 p-1">
                <p className="flex-1 text-gray-300 italic px-3 text-sm font-mono truncate">
                    {isSessionActive ? (prompt || "Listening for audio input...") : "Live mode inactive. Press Start."}
                </p>
                <button onClick={isSessionActive ? stop : start}
                    className={`w-10 h-10 flex-shrink-0 text-white rounded-md flex items-center justify-center transition-all duration-200 shadow-lg ${
                        isSessionActive 
                        ? 'bg-red-600 hover:bg-red-500 hover:scale-105' 
                        : 'bg-green-600 hover:bg-green-500 hover:scale-105'
                    }`}
                    title={isSessionActive ? "Stop Session" : "Start Live Session"}
                    >
                    {isSessionActive ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                </button>
            </div>
        ) : (
            <form onSubmit={handleSend} className="flex items-center gap-3">
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                    placeholder={mode === 'search' ? "Ask about real-time market news..." : "Query the swarm..."}
                    rows={1}
                    className="flex-1 bg-gray-700/50 text-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700 transition-all border border-gray-600 placeholder-gray-500 text-sm"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !prompt.trim()}
                    className="w-12 h-12 flex-shrink-0 bg-blue-600 text-white rounded-lg flex items-center justify-center transition-all hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20">
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        )}
      </div>
    </div>
  );
};