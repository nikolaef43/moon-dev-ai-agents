




import React, { createContext, useContext, useReducer, Dispatch, ReactNode, PropsWithChildren } from 'react';
import {
  AppState, AppAction, Position, AiAgent, Insight, Activity,
  WeeklyData, HistoricalDataPoint, OptionPosition, Strategy, Mutation,
  ChatMessage, AiBot, ActiveTab, LogEntry, ForumDebate, AgentCommand,
  APIProvider, DataProvider, RiskParameters, PreTradeCheckLog, ChatMessageSource,
  ParameterDriftLog,
  GenomeEvolutionLog,
  BoardAdvice,
  BoardConsultation,
  UnifiedSchemaV2
} from '../types';
import { getInitialAgents, getInitialBots } from '../core/agentRegistry';
import { workflowNodes, workflowEdges } from '../core/workflowRegistry';
import { TimeSync } from '../utils/timeSync';
import { Decimal } from '../utils/decimal';

const timeSync = TimeSync.getInstance();

// --- INITIAL STATE DEFINITION ---

const initialPositions: Position[] = [
  { symbol: 'BTC/USDT', qty: 2.5, entryPrice: 42100, current: 43250, pnl: 2875, pnlPercent: 2.73, entryTime: '2h ago' },
  { symbol: 'ETH/USDT', qty: 15, entryPrice: 2271.65, current: 2280, pnl: 1950, pnlPercent: 6.05, entryTime: '4h ago' },
  { symbol: 'AAPL', qty: 100, entryPrice: 175.30, current: 178.25, pnl: 295, pnlPercent: 1.68, entryTime: '1d ago' },
  { symbol: 'TSLA', qty: 50, entryPrice: 242.15, current: 245.80, pnl: 182.5, pnlPercent: 1.51, entryTime: '3h ago' }
];

const initialOptionsPositions: OptionPosition[] = [
  { id: 1, strategy: 'Long Straddle', underlying: 'SPX', strike: 4500, expiry: '2024-08-30', value: 12540, pnl: 1230, pnlPercent: 10.8, greeks: { delta: 0.02, gamma: 0.005, vega: 15.2, theta: -25.5 } },
  { id: 2, strategy: 'Short Straddle', underlying: 'QQQ', strike: 410, expiry: '2024-08-16', value: -8750, pnl: -450, pnlPercent: -5.4, greeks: { delta: -0.01, gamma: -0.008, vega: -22.1, theta: 18.9 } },
];

const generateMockPerformance = (baseSharpe: number, length: number = 60): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = [];
    let currentValue = 100;
    const drift = (baseSharpe - 1) * 0.1;
    const volatility = 1.5;
    for (let i = 0; i < length; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (length - i));
        const noise = (Math.random() - 0.48) * volatility;
        currentValue += drift + noise;
        data.push({ time: date.toISOString(), value: parseFloat(currentValue.toFixed(2)) });
    }
    return data;
};


const initialStrategies: Strategy[] = [
    { name: 'Intraday Momentum', sharpe: 1.82, drawdown: -12.5, mutations: [
        { id: 1, name: "IM_v1.1", sharpe: 1.95, drawdown: -11.2, status: 'performing', generation: 1, fitness: 172.6, horizonPerformance: generateMockPerformance(1.95) },
        { id: 3, name: "IM_v1.3", sharpe: 2.15, drawdown: -9.8, status: 'outperforming', generation: 1, fitness: 195.4, horizonPerformance: generateMockPerformance(2.15) },
    ], horizonPerformance: generateMockPerformance(1.82)},
    { name: 'WPR+BB Confluence', sharpe: 1.45, drawdown: -15.2, mutations: [], horizonPerformance: generateMockPerformance(1.45)},
    { name: 'XAUUSD Swing EMA-RSI', sharpe: 1.65, drawdown: -8.5, mutations: [], horizonPerformance: generateMockPerformance(1.65)},
];

const initialApiProviders: APIProvider[] = [
  { provider: 'gemini', apiKey: '', model: 'gemini-2.5-flash-latest', priority: 1, rateLimit: 60, fallback: true, enabled: true },
  { provider: 'openai', apiKey: '', model: 'gpt-4o', priority: 2, rateLimit: 100, fallback: true, enabled: false },
  { provider: 'deepseek', apiKey: '', model: 'deepseek-coder', priority: 3, rateLimit: 120, fallback: false, enabled: false },
  { provider: 'anthropic', apiKey: '', model: 'claude-3-opus', priority: 4, rateLimit: 50, fallback: false, enabled: false },
  { provider: 'groq', apiKey: '', model: 'llama3-70b-8192', priority: 5, rateLimit: 300, fallback: false, enabled: false },
];

const initialDataProviders: DataProvider[] = [
  { provider: 'polygon', apiKey: '', priority: 1, enabled: true },
  { provider: 'alpha_vantage', apiKey: '', priority: 2, enabled: true },
];

const initialRiskParameters: RiskParameters = {
    maxPositionSizeUSD: 50000, maxPortfolioAllocation: 25, maxLeverage: 2, minOrderSize: 100, consensusThreshold: 75,
};

const initialState: AppState = {
  systemStatus: 'active',
  tradingMode: 'paper',
  portfolioValue: 125847,
  dailyPnl: 5302,
  dailyPnlPercent: 2.65,
  positions: initialPositions,
  optionsPositions: initialOptionsPositions,
  aiAgents: getInitialAgents(),
  aiBots: getInitialBots(),
  insights: [],
  activities: [{ id: 1, type: 'SYSTEM', message: 'All agents synchronized. Circuit breaker nominal.', agent: 'InfraAgent', timestamp: new Date(Date.now() - 20000).toISOString() }],
  weeklyData: [],
  historicalData: [],
  strategies: initialStrategies,
  isProcessing: false,
  isChatOpen: false,
  isCommandPaletteOpen: false,
  chatHistory: [],
  isLiveSessionActive: false,
  transcripts: [],
  isLiveFeedActive: true,
  agentHealthThreshold: 85,
  logSafeEntries: [],
  forumDebates: [],
  dailyBriefing: null,
  agentCommands: {},
  activeTab: 'overview',
  agentFilter: { query: '', lowHealthOnly: false },
  positionFilter: { query: '' },
  notification: null,
  apiProviders: initialApiProviders,
  dataProviders: initialDataProviders,
  riskParameters: initialRiskParameters,
  preTradeCheckLog: [],
  workflow: { nodes: workflowNodes, edges: workflowEdges },
  isAnalyzingDrift: false,
  parameterDriftLogs: [],
  isEvolvingGenome: false,
  genomeEvolutionLogs: [],
  boardConsultations: [],
};


// --- REDUCER HELPER FUNCTIONS (PURE LOGIC) ---

const handleAgentHealthDegradation = (state: AppState): Partial<AppState> => {
    const agentIndex = Math.floor(Math.random() * state.aiAgents.length);
    const agent = state.aiAgents[agentIndex];
    if (!agent || agent.status === 'error') return {};

    const newHealth = Math.max(0, agent.health - Math.random() * 2);
    const newErrorCount = agent.errorCount + (Math.random() > 0.8 ? 1 : 0);
    const newDrawdown = Math.min(agent.maxDrawdown * 1.5, agent.currentDrawdown + ((agent.health - newHealth) / 100) * 0.1);

    let newStatus: AiAgent['status'] = agent.status;
    let circuitBreakerTripped = false;
    if (newErrorCount >= agent.maxErrors || newDrawdown >= agent.maxDrawdown) {
      newStatus = 'error';
      circuitBreakerTripped = true;
    }
    
    const updatedAgent: AiAgent = { ...agent, health: newHealth, errorCount: newErrorCount, currentDrawdown: newDrawdown, status: newStatus };
    const newAgents = state.aiAgents.map((a, i) => i === agentIndex ? updatedAgent : a);
    
    if (circuitBreakerTripped) {
      const reason = newErrorCount >= updatedAgent.maxErrors ? `excessive errors (${newErrorCount})` : `max drawdown exceeded (${(newDrawdown * 100).toFixed(1)}%)`;
      const newActivity: Activity = { id: Date.now(), type: 'ERROR', agent: 'HealthMonitor', message: `Circuit breaker tripped for Agent '${updatedAgent.name}' due to ${reason}.`, timestamp: new Date().toISOString() };
      return {
          aiAgents: newAgents,
          activities: [newActivity, ...state.activities].slice(0, 50),
          notification: { id: Date.now(), type: 'error', message: `Circuit breaker tripped for ${updatedAgent.name}!` }
      };
    }
    return { aiAgents: newAgents };
}

const handleToggleAgentStatus = (state: AppState, agentId: string): Partial<AppState> => {
    let toggledAgent: AiAgent | undefined;
    const updatedAgents = state.aiAgents.map(agent => {
        if (agent.id === agentId && agent.status !== 'error') {
            const newStatus = agent.status === 'active' ? 'paused' : 'active';
            toggledAgent = { ...agent, status: newStatus };
            return toggledAgent;
        }
        return agent;
    });

    if (toggledAgent) {
        const newActivity: Activity = { id: Date.now(), type: 'SYSTEM', agent: 'VORTIGEN UI', message: `Agent '${toggledAgent.name}' status set to '${toggledAgent.status}'.`, timestamp: new Date().toISOString() };
        return {
            aiAgents: updatedAgents,
            activities: [newActivity, ...state.activities].slice(0, 50)
        };
    }
    return {};
};

const handleResetCircuitBreaker = (state: AppState, agentId: string): Partial<AppState> => {
    const agentToReset = state.aiAgents.find(a => a.id === agentId);
    if (!agentToReset || agentToReset.status !== 'error') return {};

    const newAgents = state.aiAgents.map(agent => 
        agent.id === agentId 
        ? { ...agent, status: 'active' as const, errorCount: 0, health: 90, currentDrawdown: 0 } 
        : agent
    );

    const newActivity: Activity = { id: Date.now(), type: 'SYSTEM', agent: 'VORTIGEN UI', message: `Circuit breaker for Agent '${agentToReset.name}' was manually reset.`, timestamp: new Date().toISOString() };
    return {
        aiAgents: newAgents,
        activities: [newActivity, ...state.activities].slice(0, 50),
        notification: { id: Date.now(), type: 'success', message: `${agentToReset.name} has been reset.` }
    };
};

// --- MAIN REDUCER ---

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | undefined>(undefined);

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SYSTEM_STATUS': return { ...state, systemStatus: action.payload };
    case 'KILL_SWITCH': return { ...state, systemStatus: 'emergency_stop' };
    case 'ADD_ACTIVITY': return { ...state, activities: [action.payload, ...state.activities].slice(0, 50) };
    case 'TOGGLE_AGENT_STATUS': return { ...state, ...handleToggleAgentStatus(state, action.payload.agentId) };
    case 'DEGRADE_AGENT_HEALTH': return { ...state, ...handleAgentHealthDegradation(state) };
    case 'RESET_AGENT_CIRCUIT_BREAKER': return { ...state, ...handleResetCircuitBreaker(state, action.payload.agentId) };
    case 'RUN_PARAMETER_DRIFT_ANALYSIS_START': return { ...state, isAnalyzingDrift: true };
    case 'RUN_PARAMETER_DRIFT_ANALYSIS_COMPLETE': {
        const { agentId, newParameters, logs } = action.payload;
        const agentName = state.aiAgents.find(a => a.id === agentId)?.name || 'Unknown Agent';
        const newAgents = state.aiAgents.map(agent => 
            agent.id === agentId && agent.config
            ? { ...agent, config: { ...agent.config, parameters: newParameters } }
            : agent
        );
         const newActivity: Activity = {
            id: Date.now(),
            type: 'SYSTEM',
            agent: 'SelfLearningAgent',
            message: `Autonomously adapted parameters for '${agentName}' based on performance analysis.`,
            timestamp: new Date().toISOString(),
        };
        return { 
            ...state, 
            isAnalyzingDrift: false,
            aiAgents: newAgents,
            parameterDriftLogs: [...logs, ...state.parameterDriftLogs].slice(0, 50),
            activities: [newActivity, ...state.activities].slice(0, 50),
        };
    }
    case 'START_AGENT_GENOME_EVOLUTION': return { ...state, isEvolvingGenome: true, genomeEvolutionLogs: [] };
    case 'COMPLETE_AGENT_GENOME_EVOLUTION': {
        const { agentId, success, newConfig, logs } = action.payload;
        const agent = state.aiAgents.find(a => a.id === agentId);
        if (!agent) return { ...state, isEvolvingGenome: false, genomeEvolutionLogs: logs };

        const newAgents = state.aiAgents.map(a => {
            if (a.id === agentId && success) {
                return {
                    ...a,
                    config: newConfig,
                    promptVersion: a.promptVersion + 1,
                    lastEvolved: new Date().toISOString(),
                };
            }
            return a;
        });

        const newActivity: Activity = {
            id: Date.now(),
            type: success ? 'SYSTEM' : 'ALERT',
            agent: 'SelfLearningAgent',
            message: success 
                ? `Agent '${agent.name}' core logic evolved to v${agent.promptVersion + 1}.`
                : `Genome evolution for '${agent.name}' failed validation.`,
            timestamp: new Date().toISOString(),
        };

        return {
            ...state,
            isEvolvingGenome: false,
            aiAgents: newAgents,
            genomeEvolutionLogs: logs,
            activities: [newActivity, ...state.activities].slice(0, 50),
            notification: {
                id: Date.now(),
                type: success ? 'success' : 'error',
                message: newActivity.message,
            }
        };
    }
    
    case 'SET_TRADING_MODE': return { ...state, tradingMode: action.payload };
    case 'UPDATE_MARKET_DATA': {
        const oldTotalPnl = state.positions.reduce((sum, pos) => sum + pos.pnl, 0);
        
        const updatedPositions = state.positions.map(pos => {
            const newPrice = action.payload[pos.symbol];
            if (newPrice !== undefined) {
                const entryPrice = new Decimal(pos.entryPrice);
                const currentPrice = new Decimal(newPrice);
                const qty = new Decimal(pos.qty);
                const newPnl = currentPrice.subtract(entryPrice).multiply(qty);
                const costBasis = entryPrice.multiply(qty);
                const newPnlPercent = costBasis.toNumber() > 0 ? newPnl.divide(costBasis).multiply(new Decimal(100)) : new Decimal(0);

                return { ...pos, current: newPrice, pnl: newPnl.toNumber(), pnlPercent: newPnlPercent.toNumber() };
            }
            return pos;
        });

        const newTotalPnl = updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0);
        const pnlChange = newTotalPnl - oldTotalPnl;
        
        const totalInitialValue = state.positions.reduce((sum, pos) => sum + pos.qty * pos.entryPrice, 0);
        const newDailyPnlPercent = totalInitialValue > 0 ? (newTotalPnl / totalInitialValue) * 100 : 0;

        return {
            ...state,
            positions: updatedPositions,
            portfolioValue: state.portfolioValue + pnlChange,
            dailyPnl: newTotalPnl,
            dailyPnlPercent: newDailyPnlPercent
        };
    }
    case 'SET_INSIGHTS': return { ...state, insights: action.payload };
    case 'TOGGLE_BOT_STATUS': {
      return {
        ...state,
        aiBots: state.aiBots.map(bot =>
          bot.id === action.payload.botId && bot.status !== 'error'
            ? { ...bot, status: bot.status === 'active' ? 'standby' : 'active' }
            : bot
        ),
      };
    }
    case 'ADD_BOT': {
        const { agentName, bot } = action.payload;
        return {
            ...state,
            aiBots: [...state.aiBots, bot],
            aiAgents: state.aiAgents.map(agent =>
                agent.name === agentName
                    ? { ...agent, bots: [...agent.bots, bot.name] }
                    : agent
            ),
        };
    }
    case 'SET_HISTORICAL_DATA': return { ...state, historicalData: action.payload };
    case 'ADD_OPTION_POSITION': return { ...state, optionsPositions: [...state.optionsPositions, action.payload] };
    case 'ADD_STRATEGY': return { ...state, strategies: [...state.strategies, action.payload] };
    case 'ADD_MUTATION': {
        return {
            ...state,
            strategies: state.strategies.map(s =>
                s.name === action.payload.parentStrategyName
                    ? { ...s, mutations: [...s.mutations, action.payload.mutation] }
                    : s
            ),
        };
    }
    case 'EVOLVE_STRATEGY_GENERATION': {
        return {
            ...state,
            strategies: state.strategies.map(s =>
                s.name === action.payload.parentStrategyName
                    ? { ...s, mutations: action.payload.mutations }
                    : s
            ),
        };
    }
    case 'PROMOTE_MUTATION': {
        const { parentStrategyName, mutationId, newParentStrategyName } = action.payload;
        const parentStrategy = state.strategies.find(s => s.name === parentStrategyName);
        const mutationToPromote = parentStrategy?.mutations.find(m => m.id === mutationId);
        if (!parentStrategy || !mutationToPromote) return state;

        const newStrategy: Strategy = {
            name: newParentStrategyName,
            sharpe: mutationToPromote.sharpe,
            drawdown: mutationToPromote.drawdown,
            mutations: [],
            parentStrategyId: parentStrategy.parentStrategyId || Date.now(),
            horizonPerformance: mutationToPromote.horizonPerformance,
        };
        const updatedStrategies = state.strategies.map(s =>
            s.name === parentStrategyName
                ? { ...s, mutations: s.mutations.filter(m => m.id !== mutationId) }
                : s
        );
        return { ...state, strategies: [...updatedStrategies, newStrategy] };
    }
    case 'CULL_MUTATION': {
        return {
            ...state,
            strategies: state.strategies.map(s =>
                s.name === action.payload.parentStrategyName
                    ? { ...s, mutations: s.mutations.filter(m => m.id !== action.payload.mutationId) }
                    : s
            ),
        };
    }
    case 'REORDER_MUTATIONS': {
        return {
            ...state,
            strategies: state.strategies.map(s =>
                s.name === action.payload.parentStrategyName
                    ? { ...s, mutations: action.payload.orderedMutations }
                    : s
            ),
        };
    }
    case 'TOGGLE_CHAT': return { ...state, isChatOpen: !state.isChatOpen };
    case 'ADD_CHAT_MESSAGE': return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'UPDATE_LAST_CHAT_MESSAGE': {
        const lastIndex = state.chatHistory.length - 1;
        if (lastIndex < 0 || state.chatHistory[lastIndex].role !== 'model') return state;
        
        const updatedHistory = [...state.chatHistory];
        const lastMessage = { ...updatedHistory[lastIndex] };
        
        if (action.payload.content !== undefined) lastMessage.content += action.payload.content;
        if (action.payload.sources !== undefined) lastMessage.sources = action.payload.sources;
        if (lastMessage.isThinking || lastMessage.isSearching) {
            lastMessage.isThinking = false;
            lastMessage.isSearching = false;
        }

        updatedHistory[lastIndex] = lastMessage;
        return { ...state, chatHistory: updatedHistory };
    }
    case 'SET_LIVE_SESSION_STATUS': return { ...state, isLiveSessionActive: action.payload };
    case 'ADD_TRANSCRIPT': return { ...state, transcripts: [...state.transcripts, action.payload] };
    case 'TOGGLE_LIVE_FEED': return { ...state, isLiveFeedActive: !state.isLiveFeedActive };
    case 'SET_AGENT_HEALTH_THRESHOLD': return { ...state, agentHealthThreshold: action.payload };
    case 'ADD_LOG_ENTRY': {
        const newEntry: LogEntry = { ...action.payload, id: Date.now() };
        return { ...state, logSafeEntries: [newEntry, ...state.logSafeEntries].slice(0, 50) };
    }
    case 'TOGGLE_SAVE_LOG_ENTRY': {
        return {
            ...state,
            logSafeEntries: state.logSafeEntries.map(e => e.id === action.payload.id ? { ...e, saved: !e.saved } : e),
        };
    }
    case 'DELETE_LOG_ENTRY': {
        return {
            ...state,
            logSafeEntries: state.logSafeEntries.filter(e => e.id !== action.payload.id),
        };
    }
    case 'ADD_AGENT_COMMAND': {
        const { agentName, command } = action.payload;
        const currentCommands = state.agentCommands[agentName] || [];
        return {
            ...state,
            agentCommands: { ...state.agentCommands, [agentName]: [...currentCommands, command] },
        };
    }
    case 'UPDATE_AGENT_COMMAND': {
        const { agentName, commandId, updates } = action.payload;
        const currentCommands = state.agentCommands[agentName] || [];
        const updatedCommands = currentCommands.map(cmd =>
            cmd.id === commandId ? { ...cmd, ...updates, isProcessing: false } : cmd
        );
        return {
            ...state,
            agentCommands: { ...state.agentCommands, [agentName]: updatedCommands },
        };
    }
    case 'CLEAR_AGENT_COMMAND_HISTORY': {
        return {
            ...state,
            agentCommands: { ...state.agentCommands, [action.payload.agentName]: [] },
        };
    }
    case 'ADD_BOARD_ADVICE': {
        const { debateId, boardReview, finalDecision } = action.payload;
        
        const haltOrReject = ['HALT', 'reject'].includes(finalDecision.decision);
        const nextStatus: 'ceo_approval' | 'rejected' = haltOrReject ? 'rejected' : 'ceo_approval';

        return {
            ...state,
            forumDebates: state.forumDebates.map(d =>
                d.id === debateId
                    ? { ...d, boardReview, finalBoardDecision: finalDecision, debateStatus: nextStatus }
                    : d
            ),
        };
    }

    case 'APPROVE_DEBATE_SIGNAL': {
        const debate = state.forumDebates.find(d => d.id === action.payload.id);
        const newActivity: Activity = { id: Date.now(), type: 'SYSTEM', agent: 'VORTIGEN UI', message: `CEO approved signal for debate: "${debate?.topic}".`, timestamp: new Date().toISOString() };
        return {
            ...state,
            forumDebates: state.forumDebates.map(d => d.id === action.payload.id ? { ...d, debateStatus: 'executing' } : d),
            activities: [newActivity, ...state.activities].slice(0, 50)
        };
    }
    case 'REJECT_DEBATE_SIGNAL': {
        const debate = state.forumDebates.find(d => d.id === action.payload.id);
        const newActivity: Activity = { id: Date.now(), type: 'ALERT', agent: 'VORTIGEN UI', message: `CEO rejected signal for debate topic: "${debate?.topic}"`, timestamp: new Date().toISOString() };
        return {
            ...state,
            forumDebates: state.forumDebates.map(d => d.id === action.payload.id ? { ...d, debateStatus: 'rejected' } : d),
            activities: [newActivity, ...state.activities].slice(0, 50)
        };
    }
    case 'LOG_CONSENSUS_FAILURE': {
        const debate = state.forumDebates.find(d => d.id === action.payload.debateId);
        if (!debate) return state;
        const newActivity: Activity = {
            id: Date.now(),
            type: 'ALERT',
            agent: 'MetaOrchestrator',
            message: `Consensus failed for high-risk signal '${debate.summary.actionableSignal?.ticker}'. Score: ${debate.summary.consensusScore}%. Flagged for improvement review.`,
            timestamp: new Date().toISOString(),
        };
        return {
            ...state,
            forumDebates: state.forumDebates.map(d => d.id === action.payload.debateId ? { ...d, debateStatus: 'rejected', status: 'complete' } : d),
            activities: [newActivity, ...state.activities].slice(0, 50),
        };
    }

    case 'START_BOARD_CONSULTATION': {
        const newConsultation: BoardConsultation = {
            ...action.payload,
            status: 'pending',
        };
        return { ...state, boardConsultations: [newConsultation, ...state.boardConsultations].slice(0, 20) };
    }

    case 'COMPLETE_BOARD_CONSULTATION': {
        const { id, advice, routedTo } = action.payload;
        const updatedConsultations = state.boardConsultations.map(c =>
            c.id === id
                // FIX: Use 'as const' to ensure TypeScript infers 'complete' as a literal type, not a string.
                ? { ...c, status: 'complete' as const, advice, routedTo }
                : c
        );

        const updatedChatHistory = state.chatHistory.map(msg => {
            if (msg.consultationId === id) {
                return {
                    ...msg,
                    isThinking: false,
                    boardAdvice: advice,
                    content: "The AI Board has provided the following consultation:"
                };
            }
            return msg;
        });

        return {
            ...state,
            boardConsultations: updatedConsultations,
            chatHistory: updatedChatHistory,
        };
    }

    // --- Other cases ---
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'SET_DAILY_BRIEFING': return { ...state, dailyBriefing: action.payload };
    case 'TOGGLE_COMMAND_PALETTE': return { ...state, isCommandPaletteOpen: !state.isCommandPaletteOpen };
    case 'SHOW_NOTIFICATION': return { ...state, notification: { ...action.payload, id: Date.now() } };
    case 'HIDE_NOTIFICATION': return { ...state, notification: null };
    case 'ADD_FORUM_DEBATE': return { ...state, forumDebates: [action.payload, ...state.forumDebates].slice(0, 10) };
    case 'UPDATE_FORUM_DEBATE_STATUS': return { ...state, forumDebates: state.forumDebates.map(d => d.id === action.payload.id ? { ...d, debateStatus: action.payload.status } : d) };
    case 'ADD_PRE_TRADE_LOG': return { ...state, preTradeCheckLog: [action.payload, ...state.preTradeCheckLog].slice(0, 10) };
    case 'SET_AGENT_FILTER': return { ...state, agentFilter: { ...state.agentFilter, ...action.payload } };
    case 'SET_POSITION_FILTER': return { ...state, positionFilter: { ...state.positionFilter, ...action.payload } };
    case 'UPDATE_API_PROVIDER': return { ...state, apiProviders: state.apiProviders.map(p => p.provider === action.payload.provider ? { ...p, apiKey: action.payload.apiKey, enabled: action.payload.enabled } : p) };
    case 'UPDATE_DATA_PROVIDER': return { ...state, dataProviders: state.dataProviders.map(p => p.provider === action.payload.provider ? { ...p, apiKey: action.payload.apiKey, enabled: action.payload.enabled } : p) };
    case 'SET_PROCESSING_STATUS': return { ...state, isProcessing: action.payload };

    default: {
      const exhaustiveCheck: never = action;
      // In development, throw an error to catch unhandled actions immediately.
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`Unhandled action type: ${(exhaustiveCheck as any).type}`);
      }
      // In production, log and return state to prevent crashing.
      console.warn(`Unhandled action received:`, exhaustiveCheck);
      return state;
    }
  }
};

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};