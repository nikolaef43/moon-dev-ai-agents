

import React, {useState, useEffect} from 'react';
import { BotMessageSquare, Cpu, Loader2, Sparkles, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Clock, XCircle, ThumbsUp, ThumbsDown, ShieldCheck, X, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ForumDebate, ForumPost, ActionableSignal, DebateStatus, BoardAdvice, UnifiedSchemaV2 } from '../../types';
import DashboardCard from '../DashboardCard';
import { getBoardAdvice, runBoardVotingAlgorithm } from '../../services/geminiService';
import StructuredAdviceCard from '../StructuredAdviceCard';


const ComplianceProofModal: React.FC<{ proof: string, onClose: () => void }> = ({ proof, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
                <h3 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="text-green-400"/> Axiomatic Compliance Proof</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6">
                <pre className="text-sm bg-slate-800/50 p-4 rounded-lg text-slate-300 whitespace-pre-wrap font-mono">{proof}</pre>
            </div>
        </div>
    </div>
);

const SignalStatusTracker: React.FC<{ debate: ForumDebate }> = ({ debate }) => {
    const { dispatch } = useAppContext();
    const status = debate.debateStatus;
    
    const steps: { id: DebateStatus; label: string }[] = [
        { id: 'debating', label: 'Debate' },
        { id: 'synthesizing', label: 'Synthesis' },
        { id: 'risk_review', label: 'Risk Review' },
        { id: 'board_review', label: 'Board Review' },
        { id: 'ceo_approval', label: 'CEO Approval' },
        { id: 'executing', label: 'Executing' },
        { id: 'complete', label: 'Complete' },
    ];
    
    // Add 'rejected' to the flow if it's the status
    if (status === 'rejected' && !steps.find(s => s.id === 'rejected')) {
        const boardReviewIndex = steps.findIndex(s => s.id === 'board_review');
        steps.splice(boardReviewIndex + 1, 0, { id: 'rejected', label: 'Rejected' });
    }


    const currentStepIndex = steps.findIndex(step => step.id === status);

    const handleApprove = () => {
        dispatch({ type: 'APPROVE_DEBATE_SIGNAL', payload: { id: debate.id } });
    };

    const handleReject = () => {
        dispatch({ type: 'REJECT_DEBATE_SIGNAL', payload: { id: debate.id } });
    };

    return (
        <div className="pt-4 mt-4 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    let icon;
                    if (step.id === 'ceo_approval' && isCurrent) {
                        icon = (
                            <div className="flex gap-2">
                                <button onClick={handleApprove} className="p-1 bg-green-500/20 hover:bg-green-500/40 rounded-full text-green-400"><ThumbsUp size={14} /></button>
                                <button onClick={handleReject} className="p-1 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400"><ThumbsDown size={14} /></button>
                            </div>
                        );
                    } else if (step.id === 'rejected') {
                        icon = <XCircle size={16} className="text-red-400" />;
                    } else if (index < currentStepIndex) {
                        icon = <CheckCircle size={16} className="text-cyan-400" />;
                    } else if (isCurrent) {
                        icon = <Clock size={16} className="text-cyan-400 animate-spin" />;
                    } else {
                        icon = <Clock size={16} className="text-slate-500" />;
                    }
                    
                    const nodeColor = step.id === 'rejected' ? 'bg-red-900/50 border-red-500/50'
                                    : isActive ? 'bg-cyan-500/20 border-cyan-500' 
                                    : 'bg-slate-800 border-slate-700';
                    
                    const textColor = step.id === 'rejected' ? 'font-semibold text-red-400' 
                                    : isActive ? 'font-semibold text-cyan-400' 
                                    : 'text-slate-500';

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center text-center w-20">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${nodeColor}`}>
                                    {icon}
                                </div>
                                <div className={`text-xs mt-1 ${textColor}`}>{step.label}</div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mt-[-1rem] ${isActive && index < currentStepIndex && steps[index+1].id !== 'rejected' ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
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

const ActionableSignalCard: React.FC<{ signal: ActionableSignal; onShowProof: () => void; }> = ({ signal, onShowProof }) => {
    const isBullish = signal.direction === 'BULLISH';
    return (
        <div className={`p-4 rounded-lg mt-4 border-l-4 ${isBullish ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h5 className="text-xs font-bold text-slate-400 mb-2">ACTIONABLE SIGNAL</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 items-center">
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
                             <div className="text-xs text-slate-400">Strategy</div>
                             <div className="font-semibold text-sm">{signal.strategy}</div>
                        </div>
                        <div>
                             <div className="text-xs text-slate-400">Proposed Size</div>
                             <div className="font-semibold text-sm">${signal.proposedSizeUSD?.toLocaleString()}</div>
                        </div>
                        <div>
                             <div className="text-xs text-slate-400">Leverage</div>
                             <div className="font-semibold text-sm">{signal.leverage}x</div>
                        </div>
                    </div>
                </div>
                {signal.complianceProof && (
                    <button onClick={onShowProof} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600">
                        <ShieldCheck size={12} /> View Compliance Proof
                    </button>
                )}
            </div>
        </div>
    )
};


const SummaryCard: React.FC<{ session: ForumDebate, onShowProof: () => void }> = ({ session, onShowProof }) => {
    const consensusColor = (session.summary.consensusScore || 0) >= 75 ? 'text-cyan-300' : 'text-yellow-300';
    return (
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
                            <h5 className="text-xs font-bold text-slate-400 mb-1">Agent Consensus Score</h5>
                            <div className="flex items-center gap-2">
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-cyan-400 h-2.5 rounded-full" style={{width: `${session.summary.consensusScore || 0}%`}}></div>
                                </div>
                                <span className={`text-sm font-bold ${consensusColor}`}>{session.summary.consensusScore || 0}%</span>
                            </div>
                        </div>
                        {session.summary.conflictingViews && session.summary.conflictingViews.toLowerCase() !== 'none.' && (
                            <div>
                                <h5 className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1"><AlertTriangle size={12} className="text-yellow-400"/> Conflicting Views</h5>
                                <p className="text-xs text-yellow-300/80">{session.summary.conflictingViews}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {session.summary.actionableSignal && <ActionableSignalCard signal={session.summary.actionableSignal} onShowProof={onShowProof} />}
    </div>
)};

const BoardReviewCard: React.FC<{ finalDecision: UnifiedSchemaV2, individualReviews: BoardAdvice[] }> = ({ finalDecision, individualReviews }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0" title="AI Board of Directors">
                    <Users size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-300 mb-2">AI Board Final Decision</h4>
                    <StructuredAdviceCard advice={finalDecision} />
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50">
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex justify-between items-center w-full text-xs text-slate-400 hover:text-cyan-400">
                    <span className="font-semibold">View Individual Board Member Analysis</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isExpanded && (
                    <div className="mt-3 space-y-2">
                        {individualReviews.map(review => (
                            <div key={review.model} className="bg-slate-900/50 p-3 rounded-md border-l-2 border-slate-700">
                                <div className="font-bold text-xs text-slate-300 mb-1">{review.model}</div>
                                <StructuredAdviceCard advice={review} isMinimized />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const ForumDebateCard: React.FC<{ session: ForumDebate }> = ({ session }) => {
    const [showProof, setShowProof] = useState(false);
    const { dispatch } = useAppContext();

    useEffect(() => {
        if (session.debateStatus === 'board_review' && !session.boardReview && session.summary.actionableSignal) {
            const fetchAdvice = async () => {
                const individualAdvice = await getBoardAdvice(session.summary.actionableSignal!);
                const finalDecision = runBoardVotingAlgorithm(individualAdvice);
                dispatch({ type: 'ADD_BOARD_ADVICE', payload: { debateId: session.id, boardReview: individualAdvice, finalDecision } });
            };
            fetchAdvice();
        }
    }, [session.debateStatus, session.boardReview, session.id, session.summary.actionableSignal, dispatch]);

    return (
        <>
        <DashboardCard title={`Debate Topic: ${session.topic}`}>
            <div className="space-y-4">
                {session.posts.map((post, index) => <AgentPostCard key={index} post={post} />)}
                
                {session.status === 'running' && session.debateStatus === 'synthesizing' && (
                    <div className="flex items-center justify-center gap-2 text-slate-400 p-4">
                        <Loader2 size={16} className="animate-spin" /> MetaOrchestrator is synthesizing...
                    </div>
                )}
                
                {session.summary.content && <SummaryCard session={session} onShowProof={() => setShowProof(true)}/>}

                {session.finalBoardDecision && session.boardReview ? (
                    <BoardReviewCard finalDecision={session.finalBoardDecision} individualReviews={session.boardReview} />
                ) : session.debateStatus === 'board_review' && (
                     <div className="flex items-center justify-center gap-2 text-slate-400 p-4 mt-4 bg-slate-800 rounded-lg border border-slate-700">
                        <Loader2 size={16} className="animate-spin" /> AI Board of Directors is reviewing the signal...
                    </div>
                )}
                
                <SignalStatusTracker debate={session} />
            </div>
        </DashboardCard>
         {showProof && session.summary.actionableSignal?.complianceProof && (
            <ComplianceProofModal proof={session.summary.actionableSignal.complianceProof} onClose={() => setShowProof(false)} />
        )}
        </>
    )
};

const DailyBriefingCard: React.FC<{ briefing: string | null }> = ({ briefing }) => {
    if (!briefing) {
        return (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-3 text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span>AI Board of Directors is convening to establish the daily market thesis...</span>
            </div>
        );
    }

    return (
         <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/50 to-slate-900 border border-purple-500/30">
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0" title="AI Board of Directors">
                    <Users size={18} className="text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-purple-300 mb-1">AI Board Daily Briefing</h4>
                    <p className="text-sm text-slate-200">{briefing}</p>
                </div>
            </div>
        </div>
    );
};

const AgentForum: React.FC = () => {
    const { state } = useAppContext();
    const { forumDebates, dailyBriefing } = state;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <BotMessageSquare size={28} className="text-cyan-400" />
                    Agent Forum
                </h2>
            </div>
            
            <p className="text-slate-400 text-sm">
                A real-time feed of the AI agent swarm's autonomous analysis, guided by the Board's daily thesis. The system scans for events, triggers debates, and distills results into actionable signals.
            </p>

            <DailyBriefingCard briefing={dailyBriefing} />

            {state.forumDebates.length === 0 && (
                 <div className="text-center py-20 text-slate-500 bg-slate-900 rounded-lg border border-dashed border-slate-700">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4" />
                    <p>Awaiting first autonomous trigger... The system is actively monitoring market events based on the board's briefing.</p>
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
