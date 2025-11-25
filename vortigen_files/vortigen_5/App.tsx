
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KillSwitchModal from './components/KillSwitchModal';
import Overview from './components/tabs/Overview';
import Positions from './components/tabs/Positions';
import AgentCommand from './components/tabs/AgentCommand';
import Insights from './components/tabs/Insights';
import CausalAnalytics from './components/tabs/Analytics'; // Renamed import
import Activity from './components/tabs/Activity';
import Configuration from './components/tabs/Configuration';
import Options from './components/tabs/Options';
import StrategyLab from './components/tabs/StrategyLab';
import LiveAssist from './components/tabs/LiveAssist';
import ManifoldInspector from './components/tabs/VisualAnalysis'; // Renamed import
import RiskHub from './components/tabs/RiskHub';
import LogSafe from './components/tabs/LogSafe';
import Volatility from './components/tabs/Volatility';
import AgentForum from './components/tabs/AgentForum';
import SocialSentiment from './components/tabs/SocialSentiment';
import SystemEvolution from './components/tabs/SystemEvolution';
import ChatWidget from './components/ChatWidget';
import Notification from './components/Notification';
import GenerateReportModal from './components/GenerateReportModal';
import CommandPalette from './components/CommandPalette';
import { ActiveTab, DebateStatus, Position, PreTradeCheckLog, Activity as ActivityType, SystemStatus, ActionableSignal, BoardConsultation } from './types';
import { fetchMarketData, fetchPolygonHistoricalData } from './services/marketDataService';
import { runForumDebateCycle, getDailyBriefing, getManualBoardAdvice } from './services/geminiService';
import useWebSocket from './hooks/useWebSocket';
import { MessageCircle } from 'lucide-react';
import Agents from './components/tabs/Agents';
import Bots from './components/tabs/Bots';
import Workflow from './components/tabs/Workflow';
import EconomicTwin from './components/tabs/EconomicTwin'; // New import
import AIBoard from './components/tabs/AIBoard';
import SystemAudit from './components/tabs/SystemAudit';
import { TimeSync } from './utils/timeSync';

const TABS: Record<ActiveTab, React.FC> = {
    overview: Overview,
    positions: Positions,
    agentCommand: AgentCommand,
    agents: Agents,
    bots: Bots,
    insights: Insights,
    causalAnalytics: CausalAnalytics,
    activity: Activity,
    config: Configuration,
    options: Options,
    strategyLab: StrategyLab,
    liveAssist: LiveAssist,
    manifoldInspector: ManifoldInspector,
    risk: RiskHub,
    logSafe: LogSafe,
    volatility: Volatility,
    agentForum: AgentForum,
    socialSentiment: SocialSentiment,
    systemEvolution: SystemEvolution,
    workflow: Workflow,
    economicTwin: EconomicTwin,
    aiBoard: AIBoard,
    systemAudit: SystemAudit,
};


const App = () => {
    const { state, dispatch } = useAppContext();
    const { activeTab, systemStatus, positions, isCommandPaletteOpen, isProcessing, riskParameters, forumDebates } = state;
    const [showSidebar, setShowSidebar] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    
    const timeSync = TimeSync.getInstance();

    const ActiveComponent = TABS[activeTab];
    
    useEffect(() => {
        const fetchBriefing = async () => {
            const briefing = await getDailyBriefing();
            dispatch({ type: 'SET_DAILY_BRIEFING', payload: briefing });
        };
        fetchBriefing();
    }, [dispatch]);

    // --- Centralized Control Functions ---
    const toggleStatus = useCallback(() => {
        const newStatus: SystemStatus = systemStatus === 'active' ? 'paused' : 'active';
        dispatch({ type: 'SET_SYSTEM_STATUS', payload: newStatus });
    }, [systemStatus, dispatch]);

    const killSwitch = useCallback(() => {
        dispatch({ type: 'KILL_SWITCH' });
    }, [dispatch]);

    const handleManualCycle = useCallback(async () => {
        if (isProcessing) return;

        dispatch({ type: 'SET_PROCESSING_STATUS', payload: true });
        
        // Simulate a complex, multi-agent task cycle
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const now = await timeSync.now();
        const activityPayload: ActivityType = {
            id: now,
            type: 'DECISION', 
            message: 'Manual cycle completed. 1 high-conviction signal identified.', 
            agent: 'MetaOrchestrator', 
            timestamp: new Date(now).toISOString()
         };
        dispatch({ type: 'ADD_ACTIVITY', payload: activityPayload });
        dispatch({ type: 'SET_PROCESSING_STATUS', payload: false });

    }, [isProcessing, dispatch, timeSync]);
    
    // --- Autonomous System Simulation Loops ---
    useEffect(() => {
        const autonomousHeartbeat = setInterval(async () => {
            if (systemStatus !== 'active') return;
            
            try {
                const debate = await runForumDebateCycle();
                dispatch({ type: 'ADD_FORUM_DEBATE', payload: debate });
            } catch (error) {
                console.error("Autonomous debate cycle failed:", error);
            }
        }, 15000);

        return () => clearInterval(autonomousHeartbeat);
    }, [systemStatus, dispatch]);
    
    const validateSignal = (signal: ActionableSignal): { pass: boolean; reason: string } => {
        const { maxPositionSizeUSD, maxLeverage } = riskParameters;
        if (signal.proposedSizeUSD && signal.proposedSizeUSD > maxPositionSizeUSD) {
            return { pass: false, reason: `Exceeds max position size ($${signal.proposedSizeUSD} > $${maxPositionSizeUSD}).` };
        }
        if (signal.leverage && signal.leverage > maxLeverage) {
            return { pass: false, reason: `Exceeds max leverage (${signal.leverage}x > ${maxLeverage}x).` };
        }
        return { pass: true, reason: 'Pre-trade risk parameters validated by RiskOfficer.' };
    };

    // Effect to handle the debate pipeline
    useEffect(() => {
        const runningDebates = forumDebates.filter(d => d.status === 'running');
        
        runningDebates.forEach(debate => {
            const { id, debateStatus, summary } = debate;
            const signal = summary.actionableSignal;

            const pipelineSteps: { [key in DebateStatus]?: { next: DebateStatus, delay: number } } = {
                'debating': { next: 'synthesizing', delay: 2000 },
                'synthesizing': { next: 'risk_review', delay: 2000 },
                'risk_review': { next: 'board_review', delay: 1500 },
                'executing': { next: 'complete', delay: 2000 },
            };

            const currentStep = pipelineSteps[debateStatus];

            if (currentStep) {
                setTimeout(() => {
                    if (debateStatus === 'risk_review') {
                         if (!signal) {
                             dispatch({ type: 'REJECT_DEBATE_SIGNAL', payload: { id } });
                             return;
                         }
                        // Consensus Check
                        if (summary.consensusScore && summary.consensusScore < riskParameters.consensusThreshold) {
                            dispatch({ type: 'LOG_CONSENSUS_FAILURE', payload: { debateId: id } });
                            return;
                        }
                        
                        // Risk Backstop Check
                        const validation = validateSignal(signal);
                        const logEntry: PreTradeCheckLog = {
                            id: Date.now(),
                            timestamp: new Date().toISOString(),
                            signal,
                            status: validation.pass ? 'PASS' : 'FAIL',
                            reason: validation.reason,
                        };
                        dispatch({ type: 'ADD_PRE_TRADE_LOG', payload: logEntry });
                        dispatch({ type: 'ADD_ACTIVITY', 
                            payload: { 
                                id: Date.now() + 1,
                                type: validation.pass ? 'SYSTEM' : 'ERROR', 
                                agent: 'RiskOfficer', 
                                message: `Pre-trade check for ${signal.ticker}: ${logEntry.status}. Reason: ${logEntry.reason}`,
                                timestamp: new Date().toISOString()
                            }
                        });

                        if (!validation.pass) {
                            dispatch({ type: 'REJECT_DEBATE_SIGNAL', payload: { id } });
                            return;
                        }
                    }

                    if (debateStatus === 'executing' && signal) {
                         dispatch({ type: 'ADD_ACTIVITY', 
                            payload: { 
                                id: Date.now(), 
                                type: 'EXECUTION', 
                                agent: 'ExecutionOptimizerAgent', 
                                message: `Signal for ${signal.ticker} ${signal.direction} executed successfully via TWAP bot.`,
                                timestamp: new Date().toISOString(),
                                temporalAlpha: parseFloat((Math.random() * 5).toFixed(2)),
                            }
                        });
                    }

                    dispatch({ type: 'UPDATE_FORUM_DEBATE_STATUS', payload: { id, status: currentStep.next } });
                }, currentStep.delay);
            }
        });
    }, [forumDebates, dispatch, riskParameters]);

    // Effect to handle manual board consultations
    useEffect(() => {
        const pendingConsultation = state.boardConsultations.find(c => c.status === 'pending');
        if (pendingConsultation) {
            const processConsultation = async (consultation: BoardConsultation) => {
                const { advice, routedTo } = await getManualBoardAdvice(consultation);
                dispatch({
                    type: 'COMPLETE_BOARD_CONSULTATION',
                    payload: { id: consultation.id, advice, routedTo }
                });
            };
            processConsultation(pendingConsultation);
        }
    }, [state.boardConsultations, dispatch]);


    useEffect(() => {
        const healthDegradationInterval = setInterval(() => {
            if (systemStatus === 'active') {
                dispatch({ type: 'DEGRADE_AGENT_HEALTH' });
            }
        }, 10000);

        return () => clearInterval(healthDegradationInterval);
    }, [systemStatus, dispatch]);
    
    // Command Palette Keyboard Shortcut
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [dispatch]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar
                showSidebar={showSidebar}
            />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Notification />
                {isCommandPaletteOpen && <CommandPalette />}
                <Header
                    showSidebar={showSidebar}
                    toggleSidebar={() => setShowSidebar(!showSidebar)}
                    onGenerateReport={() => setShowReportModal(true)}
                    systemStatus={systemStatus}
                    isProcessing={isProcessing}
                    toggleStatus={toggleStatus}
                    killSwitch={killSwitch}
                    handleManualCycle={handleManualCycle}
                />
                <KillSwitchModal />
                <main className="flex-1 overflow-y-auto p-8 bg-slate-900">
                   {ActiveComponent && <ActiveComponent />}
                </main>
            </div>
            {state.isChatOpen && <ChatWidget />}
            <GenerateReportModal 
                show={showReportModal} 
                onClose={() => setShowReportModal(false)} 
                appState={state}
            />
            <button
                onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
                className="fixed bottom-8 right-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full p-4 shadow-lg z-50 no-print"
                aria-label="Toggle Chat"
            >
                <MessageCircle size={24} />
            </button>
        </div>
    );
};

export default App;
