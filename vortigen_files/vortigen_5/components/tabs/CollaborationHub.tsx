
import React from 'react';
import { BotMessageSquare, Cpu, Loader2, Sparkles, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ForumDebate, ForumPost, ActionableSignal, DebateStatus } from '../../types';
import DashboardCard from '../DashboardCard';

const SignalStatusTracker: React.FC<{ status: DebateStatus }> = ({ status }) => {
    const steps: { id: DebateStatus; label: string }[] = [
        { id: 'debating', label: 'Debating' },
        { id: 'synthesizing', label: 'Synthesizing' },
        { id: 'risk_review', label: 'Risk Review' },
        { id: 'ceo_approval', label: 'CEO Approval' },
        { id: 'executing', label: 'Executing' },
        { id: 'complete', label: 'Complete' },
    ];

    const currentStepIndex = steps.findIndex(step => step.id === status);

    return (
        <div className="pt-4 mt-4 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'bg-cyan-500/20 border-cyan-500' : 'bg-slate-800 border-slate-700'}`}>
                                    {index < currentStepIndex ? <CheckCircle size={16} className="text-cyan-400" /> : <Clock size={16} className={isActive ? 'text-cyan-400 animate-spin' : 'text-slate-500'} />}
                                </div>
                                <div className={`text-xs mt-1 ${isActive ? 'font-semibold text-cyan-400' : 'text-slate-500'}`}>{step.label}</div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mt-[-1rem] ${isActive && index < currentStepIndex ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

const AgentPostCard: React.FC<{ post: ForumPost }> = ({ post }) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0" title={post.agentName}>
            <Cpu size={18} className="text-purple-400" />
        </div>
        <div className="flex-1 bg-slate-800/50 p-3 rounded-lg space-y-2">
            <h4 className="font-bold text-sm text-slate-300">{post.agentName}</h4>
            {post.isPosting ? (
                 <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 size={14} className="animate-spin" /> Thinking...
                </div>
            ) : (
                <>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{post.content}</p>
                    {post.media?.type === 'image' && (
                        <div className="pt-2">
                            <img src={post.media.url} alt="Analyzed media" className="rounded-md max-w-xs border border-slate-700" />
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
);

const ActionableSignalCard: React.FC<{ signal: ActionableSignal }> = ({ signal }) => {
    const isBullish = signal.direction === 'BULLISH';
    return (
        <div className={`p-4 rounded-lg mt-4 border-l-4 ${isBullish ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
            <h5 className="text-xs font-bold text-slate-400 mb-2">ACTIONABLE SIGNAL</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div className="font-bold text-xl">${signal.ticker}</div>
                <div className={`flex items-center gap-2 font-semibold ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
                    {isBullish ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                    {signal.direction}
                </div>
                <div>
                     <div className="text-xs text-slate-400">Confidence</div>
                     <div className="font-bold">{signal.confidence}%</div>
                </div>
                 <div>
                     <div className="text-xs text-slate-400">Suggested Strategy</div>
                     <div className="font-semibold text-sm">{signal.strategy}</div>
                </div>
            </div>
        </div>
    )
};


const SummaryCard: React.FC<{ session: ForumDebate }> = ({ session }) => (
     <div className="mt-4 p-4 bg-gradient-to-br from-cyan-900/50 to-slate-900 rounded-lg border border-cyan-500/30">
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0" title="MetaOrchestratorAgent">
                <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm text-cyan-300 mb-2">MetaOrchestratorAgent Synthesis</h4>
                <div className="space-y-4">
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{session.summary.content}</p>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 mb-1">Consensus Score</h5>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-cyan-400 h-2.5 rounded-full" style={{width: `${session.summary.consensusScore || 0}%`}}></div>
                                </div>
                                <span className="text-sm font-bold text-cyan-300">{session.summary.consensusScore || 0}%</span>
                            </div>
                        </div>
                        {session.summary.conflictingViews && session.summary.conflictingViews.toLowerCase() !== 'none' && (
                            <div>
                                <h5 className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1"><AlertTriangle size={12} className="text-yellow-400"/> Conflicting Views</h5>
                                <p className="text-xs text-yellow-300/80">{session.summary.conflictingViews}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {session.summary.actionableSignal && <ActionableSignalCard signal={session.summary.actionableSignal} />}
    </div>
);


const ForumDebateCard: React.FC<{ session: ForumDebate }> = ({ session }) => (
    <DashboardCard title={`Debate Topic: ${session.topic}`}>
        <div className="space-y-4">
            {session.posts.map((post, index) => <AgentPostCard key={index} post={post} />)}
            {session.status === 'complete' && <SummaryCard session={session} />}
            <SignalStatusTracker status={session.debateStatus} />
        </div>
    </DashboardCard>
);

const AgentForum: React.FC = () => {
    const { state } = useAppContext();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <BotMessageSquare size={28} className="text-cyan-400" />
                    Agent Forum
                </h2>
            </div>
            
            <p className="text-slate-400 text-sm">
                A real-time feed of the AI agent swarm's autonomous analysis. The system continuously scans for market-moving events, triggers collaborative debates, and distills the results into actionable signals.
            </p>

            {state.forumDebates.length === 0 && (
                 <div className="text-center py-20 text-slate-500 bg-slate-900 rounded-lg border border-dashed border-slate-700">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4" />
                    <p>Awaiting first autonomous trigger... The system is actively monitoring market events.</p>
                </div>
            )}
            
            <div className="space-y-6">
                 {state.forumDebates.map(session => (
                    <ForumDebateCard key={session.id} session={session} />
                ))}
            </div>
        </div>
    );
};

export default AgentForum;
