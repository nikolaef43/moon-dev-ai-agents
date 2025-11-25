import { useState, useRef, useCallback, useEffect } from 'react';
import { LiveServerMessage } from '@google/genai';
import { startLiveSession, createAudioBlob } from '../services/liveService';
import { decode, decodeAudioData } from '../utils/audio';

export const useLiveSession = (onTranscriptionUpdate: (isFinal: boolean, text: string) => void) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    // For audio playback
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopAudioPlayback = useCallback(() => {
        if (outputAudioContextRef.current) {
            audioSourcesRef.current.forEach(source => {
                source.stop();
            });
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            if (outputAudioContextRef.current.state !== 'closed') {
                outputAudioContextRef.current.close();
                outputAudioContextRef.current = null;
            }
        }
    }, []);

    const stopSession = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (error) {
                console.error("Error closing live session:", error);
            } finally {
                sessionPromiseRef.current = null;
            }
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }
        
        stopAudioPlayback();
        setIsSessionActive(false);
    }, [stopAudioPlayback]);
    
    // Effect to clean up on component unmount
    useEffect(() => {
        return () => {
            stopSession();
        };
    }, [stopSession]);

    const handleLiveMessage = useCallback(async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
            const transcription = message.serverContent.inputTranscription.text;
            onTranscriptionUpdate(false, transcription);
        }
        if (message.serverContent?.turnComplete) {
            const finalTranscription = message.serverContent?.inputTranscription?.text ?? '';
            onTranscriptionUpdate(true, finalTranscription);
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
        }

        if (message.serverContent?.interrupted) {
            stopAudioPlayback();
        }
    }, [onTranscriptionUpdate, stopAudioPlayback]);


    const start = useCallback(async () => {
        if (isSessionActive) return;

        try {
            // Pre-initialize output audio context to prevent latency on first playback
            if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                 outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }

            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsSessionActive(true);

            sessionPromiseRef.current = startLiveSession({
                onOpen: () => {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current!);
                    scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createAudioBlob(inputData);
                        sessionPromiseRef.current?.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    sourceNodeRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(audioContextRef.current.destination);
                },
                onMessage: handleLiveMessage,
                onError: (e) => {
                    console.error("Live session error:", e);
                    stopSession();
                },
                onClose: () => {
                    console.log("Live session closed.");
                    // No need to call stopSession here as it's the official close event.
                    // Let's ensure state is updated cleanly.
                    setIsSessionActive(false);
                }
            });
        } catch (error) {
            console.error("Failed to start live session:", error);
            await stopSession(); // Clean up if start fails
        }
    }, [isSessionActive, handleLiveMessage, stopSession]);

    const stop = useCallback(() => {
        stopSession();
    }, [stopSession]);

    return { isSessionActive, start, stop };
};