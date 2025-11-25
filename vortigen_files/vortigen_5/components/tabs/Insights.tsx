import React, { useEffect, useState, useRef } from 'react';
import { Zap, MessageSquare, ThumbsUp, Volume2, Loader, Cpu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { generateInsight, getTextToSpeech } from '../../services/geminiService';
import { Insight } from '../../types';
import { decodeAudioData } from '../../utils/audioUtils';

const InsightCard: React.FC<{
    insight: Insight,
    isPlaying: boolean,
    onPlay: (text: string) => void,
    onComment: () => void,
}> = ({ insight, isPlaying, onPlay, onComment }) => {

    const getConfidenceColor = (score: number) => {
        if (score > 90) return 'bg-green-500';
        if (score > 80) return 'bg-yellow-500';
        return 'bg-orange-500';
    }

    return (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 flex flex-col h-full">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Cpu size={18} className="text-cyan-400"/>
                </div>
                <div>
                    <div className="font-bold text-sm text-slate-200">{insight.agent}</div>
                    <div className="text-xs text-slate-500">{insight.time} ago</div>
                </div>
            </div>
            <p className="text-slate-300 text-sm flex-grow mb-3">{insight.text}</p>
            <div className="flex items-center justify-between">
                <div className="w-full bg-slate-800 rounded-full h-2.5 mr-4">
                    <div className={`${getConfidenceColor(insight.confidence)} h-2.5 rounded-full`} style={{ width: `${insight.confidence}%` }}></div>
                </div>
                <span className="text-xs font-bold text-slate-400">{insight.confidence}%</span>
            </div>
            <div className="flex gap-4 text-slate-500 text-xs items-center mt-3 pt-3 border-t border-slate-800">
                <button className="flex items-center gap-1 hover:text-green-400"><ThumbsUp size={12}/> ({insight.likes})</button>
                <button onClick={onComment} className="flex items-center gap-1 hover:text-blue-400"><MessageSquare size={12}/> Comment</button>
                <button 
                    onClick={() => onPlay(insight.text)} 
                    className="flex items-center gap-1 ml-auto hover:text-cyan-400"
                >
                    {isPlaying ? (
                        <>
                            <Loader size={12} className="animate-spin" /> Playing
                        </>
                    ) : (
                        <>
                            <Volume2 size={12} /> Read
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const SkeletonCard: React.FC = () => (
    <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 animate-skeleton-pulse">
        <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0"></div>
            <div className="flex-grow">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-slate-700 rounded w-1/4"></div>
            </div>
        </div>
        <div className="space-y-2 mb-3">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
        </div>
        <div className="h-2.5 bg-slate-700 rounded w-full mb-4"></div>
        <div className="flex gap-4 items-center mt-3 pt-3 border-t border-slate-800">
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/4 ml-auto"></div>
        </div>
    </div>
);


const Insights: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { insights } = state;
    const [isLoading, setIsLoading] = useState(false);
    const [playingInsight, setPlayingInsight] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const getAudioContext = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
             const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
             if (AudioContext) {
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
             }
        }
        return audioContextRef.current;
    };

    const stopCurrentAudio = () => {
        if (currentAudioSourceRef.current) {
            currentAudioSourceRef.current.stop();
            currentAudioSourceRef.current.disconnect();
            currentAudioSourceRef.current = null;
        }
        setPlayingInsight(null);
    };

    const fetchNewInsights = async () => {
        setIsLoading(true);
        try {
            const agents: ('QuantStrategist' | 'ResearchAgent' | 'RiskOfficer')[] = ['QuantStrategist', 'ResearchAgent', 'RiskOfficer'];
            const newInsights: Insight[] = [];
    
            const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    
            for (const agent of agents) {
                const result = await generateInsight(agent);
                if (result) {
                    newInsights.push(result);
                }
                await delay(2000);
            }
            
            if (newInsights.length > 0) {
                const freshInsights = [...newInsights, ...insights.slice(0, 10)];
                dispatch({ type: 'SET_INSIGHTS', payload: freshInsights });
            }
        } catch (error) {
            console.error("An error occurred while fetching new insights:", error);
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { message: 'Failed to fetch AI insights due to rate limiting.', type: 'error' }});
        } finally {
            setIsLoading(false);
        }
    };

    const handleReadAloud = async (insightText: string) => {
        if (playingInsight === insightText) {
            stopCurrentAudio();
            return;
        }

        if (currentAudioSourceRef.current) {
            stopCurrentAudio();
        }

        setPlayingInsight(insightText);
        const audioData = await getTextToSpeech(insightText);
        if (audioData) {
            const audioContext = getAudioContext();
            if (!audioContext) {
                console.error("AudioContext not supported");
                setPlayingInsight(null);
                return;
            }
            try {
                const audioBuffer = await decodeAudioData(audioData, audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
                currentAudioSourceRef.current = source;
                source.onended = () => {
                    if (currentAudioSourceRef.current === source) {
                       stopCurrentAudio();
                    }
                };
            } catch (error) {
                console.error("Error playing audio:", error);
                stopCurrentAudio();
            }
        } else {
            setPlayingInsight(null);
        }
    };
    
    const handleCommentClick = () => {
        if (!state.isChatOpen) {
            dispatch({ type: 'TOGGLE_CHAT' });
        }
    };

    useEffect(() => {
        // Cleanup audio context on unmount
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);
    
    const featuredInsight = insights[0];
    const quantInsights = insights.filter(i => i.agent === 'QuantStrategist').slice(0,3);
    const researchInsights = insights.filter(i => i.agent === 'ResearchAgent').slice(0,3);
    const riskInsights = insights.filter(i => i.agent === 'RiskOfficer').slice(0,3);


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3"><Zap size={28} className="text-cyan-400"/> AI Insights Hub</h2>
                <button 
                    onClick={fetchNewInsights} 
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                    {isLoading ? <><Loader size={16} className="animate-spin" /> Generating...</> : 'Generate New Insights'}
                </button>
            </div>

            {isLoading && (
                 <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/50 p-6">
                    <h3 className="text-sm font-bold text-cyan-400 mb-2">GENERATING FEATURED INSIGHT...</h3>
                    <SkeletonCard />
                </div>
            )}

            {!isLoading && featuredInsight && (
                <div className="bg-slate-900 rounded-lg border-2 border-cyan-500/50 p-6">
                    <h3 className="text-sm font-bold text-cyan-400 mb-2">FEATURED INSIGHT OF THE DAY</h3>
                    <InsightCard 
                        insight={featuredInsight}
                        isPlaying={playingInsight === featuredInsight.text}
                        onPlay={handleReadAloud}
                        onComment={handleCommentClick}
                    />
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                    <h3 className="font-bold text-lg mb-4">Market Signals (QuantStrategist)</h3>
                    <div className="space-y-4">
                        {isLoading ? [...Array(3)].map((_, i) => <SkeletonCard key={i}/>) : quantInsights.map((insight, i) => (
                             <InsightCard key={i} insight={insight} isPlaying={playingInsight === insight.text} onPlay={handleReadAloud} onComment={handleCommentClick}/>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg mb-4">Macro Analysis (ResearchAgent)</h3>
                     <div className="space-y-4">
                        {isLoading ? [...Array(3)].map((_, i) => <SkeletonCard key={i}/>) : researchInsights.map((insight, i) => (
                             <InsightCard key={i} insight={insight} isPlaying={playingInsight === insight.text} onPlay={handleReadAloud} onComment={handleCommentClick}/>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg mb-4">Portfolio Risk Alerts (RiskOfficer)</h3>
                     <div className="space-y-4">
                        {isLoading ? [...Array(3)].map((_, i) => <SkeletonCard key={i}/>) : riskInsights.map((insight, i) => (
                             <InsightCard key={i} insight={insight} isPlaying={playingInsight === insight.text} onPlay={handleReadAloud} onComment={handleCommentClick}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;