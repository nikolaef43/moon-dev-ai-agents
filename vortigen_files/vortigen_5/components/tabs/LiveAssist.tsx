import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Mic, Bot, History, BotIcon, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { connectLiveSession } from '../../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { createBlob, decodeAudioData } from '../../utils/audioUtils';
import { decode } from '../../utils/audioUtils';

// Correctly infer the LiveSession type from the connect function's return promise
type LiveSession = Awaited<ReturnType<typeof connectLiveSession>>;

// --- Sub-components defined outside the main component to prevent re-creation on render ---

const Orb: React.FC<{ status: 'idle' | 'listening' | 'speaking' | 'error' }> = ({ status }) => {
    const baseClasses = "relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300";
    const statusMap = {
        idle: { bg: 'bg-slate-800', icon: <Mic size={56} className="text-slate-500" /> },
        listening: { bg: 'bg-green-500/20', icon: <Mic size={56} className="text-green-300" /> },
        speaking: { bg: 'bg-cyan-500/20 animate-orb-glow', icon: <BotIcon size={56} className="text-cyan-300" /> },
        error: { bg: 'bg-red-500/20', icon: <Mic size={56} className="text-red-300" /> },
    };

    return (
        <div className="relative flex items-center justify-center">
             {status === 'speaking' && (
                <div className="absolute w-64 h-64 flex items-center justify-center gap-1">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="w-1.5 h-16 bg-cyan-500/50 rounded-full animate-voice-wave" style={{ animationDelay: `${i * 50}ms` }}/>
                    ))}
                </div>
             )}
             <div className={`${baseClasses} ${statusMap[status].bg}`}>
                 {statusMap[status].icon}
             </div>
        </div>
    );
};
    
const ConversationStarter: React.FC<{text: string}> = ({text}) => (
    <div className="px-3 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">
        "{text}"
    </div>
);


// --- Main Component ---

const LiveAssist: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { isLiveSessionActive, transcripts } = state;
    const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
    const [liveUserTranscript, setLiveUserTranscript] = useState('');
    
    const sessionRef = useRef<LiveSession | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const stopSession = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
         if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(console.error);
            outputAudioContextRef.current = null;
        }
        
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        dispatch({ type: 'SET_LIVE_SESSION_STATUS', payload: false });
        setStatus('idle');
        setLiveUserTranscript('');
    }, [dispatch]);

    const startSession = async () => {
        if (isLiveSessionActive) return;
        setStatus('listening');
        dispatch({ type: 'SET_LIVE_SESSION_STATUS', payload: true });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const inputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            
            const outputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;
            
            const gainNode = outputAudioContext.createGain();
            gainNode.connect(outputAudioContext.destination);

            let currentInputTranscription = '';
            let currentOutputTranscription = '';

            const sessionPromise = connectLiveSession({
                onopen: () => {
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;

                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        }).catch(e => console.error("Error sending realtime input:", e));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                     if (message.serverContent?.inputTranscription) {
                        const newText = message.serverContent.inputTranscription.text;
                        currentInputTranscription += newText;
                        setLiveUserTranscript(prev => prev + newText); // Update live transcript
                    }
                     if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription += message.serverContent.outputTranscription.text;
                    }
                     if (message.serverContent?.turnComplete) {
                        dispatch({ type: 'ADD_TRANSCRIPT', payload: { user: currentInputTranscription, model: currentOutputTranscription }});
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                        setLiveUserTranscript(''); // Clear live transcript after turn
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        setStatus('speaking');
                        const outputCtx = outputAudioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);

                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(gainNode);
                        
                        source.onended = () => {
                            sourcesRef.current.delete(source);
                            if (sourcesRef.current.size === 0 && sessionRef.current) { // check if session is still active
                                setStatus('listening');
                            }
                        };

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setStatus('error');
                    stopSession();
                },
                onclose: () => {
                    // The onclose in stopSession will handle the rest
                },
            });

            sessionRef.current = await sessionPromise;
        } catch (error) {
            console.error('Failed to start live session:', error);
            setStatus('error');
            stopSession();
        }
    };

    const handleToggleSession = () => {
        if (isLiveSessionActive) {
            stopSession();
        } else {
            startSession();
        }
    };
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopSession();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">Live AI Assist</h2>
                <p className="text-slate-400">Click the microphone to start a real-time conversation with VORTIGEN.</p>
            </div>
            
            <button onClick={handleToggleSession}>
                <Orb status={status} />
            </button>
            
            <div className="space-y-2 h-20">
                 <p className="text-lg font-semibold capitalize">{status}</p>
                 <p className="text-sm text-slate-500 h-5">
                    {status === 'idle' && 'Click to start'}
                    {status === 'listening' && 'Listening for your command...'}
                    {status === 'speaking' && 'VORTIGEN is responding...'}
                    {status === 'error' && 'Connection error. Please try again.'}
                 </p>
                 {liveUserTranscript && (
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-200 p-2 bg-slate-800/50 rounded-lg">
                        <User size={18} className="text-slate-400" />
                        <span className="italic">"{liveUserTranscript}"</span>
                    </div>
                )}
            </div>
            
             <div className="space-y-3 pt-6">
                <h3 className="font-semibold text-slate-400">Conversation Starters</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                    <ConversationStarter text="Summarize my portfolio performance."/>
                    <ConversationStarter text="What are the top risk factors right now?"/>
                    <ConversationStarter text="Explain the 'Intraday Momentum' strategy."/>
                </div>
            </div>

        </div>
    );
};

export default LiveAssist;