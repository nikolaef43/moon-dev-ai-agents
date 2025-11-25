

export type AIMode = 'fast' | 'smart' | 'search' | 'live';
export type View = 'dashboard' | 'agents' | 'strategies' | 'risk' | 'logs' | 'collective' | 'evolution' | 'simulation' | 'data' | 'consensus' | 'board' | 'quantum' | 'router' | 'predictions' | 'boardroom';
export type AgentStatus = 'active' | 'inactive' | 'monitoring' | 'error';
export type StrategyType = 'Triangle Flag Breakout' | 'RR=3 Short' | 'Market Making' | 'Gamma Scalping' | 'Order Flow Imbalance' | 'Macro Regime' | 'Smart Money' | 'XAUUSD Hybrid EMA' | 'AI Agent Trading Bot' | 'XAUUSD Swing EMA-RSI' | 'Polymarket Prediction Agent';
export type Sentiment = 'Aggressive Growth' | 'Calculated Risk' | 'Neutral' | 'Risk-Averse' | 'Defensive';
export type LogLevel = 'INFO' | 'WARN' | 'CRITICAL' | 'CONSENSUS' | 'EVOLUTION' | 'BOARD';
export type SimulationScenario = 'Market Crash' | 'High Volatility' | 'Liquidity Squeeze' | 'Geopolitical Shock';
export type DataSourceStatus = 'Discovered' | 'Evaluating' | 'Integrating' | 'Active' | 'Rejected';
export type DataSourceType = 'API' | 'Satellite Imagery' | 'Decentralized Oracle' | 'Knowledge Graph' | 'Quantum Entropy';
export type VoteDecision = 'yes' | 'no' | 'abstain';
export type ConsensusSignalStatus = 'pending' | 'approved' | 'rejected';
export type AIBoardModel = 'DeepSeek-V2' | 'Qwen-Max' | 'GPT-4o' | 'Grok-2';
export type AIBoardMemberStatus = 'Online' | 'Recalibrating' | 'Offline';
export type AgentType = 'Agent' | 'Bot';
export type QuantumAddonStatus = 'ACTIVE' | 'DEV' | 'FUTURE';
export type ModelTaskType = 'REASONING' | 'LONG_CONTEXT' | 'SAFETY' | 'TRADE_ADVICE' | 'EXECUTION_ADVICE';


export interface ModelRoute {
    taskType: ModelTaskType;
    primaryModel: AIBoardModel;
    fallbackModel?: AIBoardModel;
    description: string;
}

export interface Source {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  sources?: Source[];
}

export interface Agent {
  id: string;
  type: AgentType;
  strategy: StrategyType;
  status: AgentStatus;
  symbols: string[];
  pnl: number;
  trades: number;
  collaboration?: string;
  genomeVersion: string;
  fitnessScore: number;
  genes: {
    risk_tolerance: number;
    adaptation_speed: number;
    data_source_preference: number;
  };
  tools?: string[];
}

export interface Strategy {
    name: StrategyType;
    winRate: number;
    profitFactor: number;
    validation: string;
    edgeVsRandom: number; // in sigma
    sourceCode?: string;
    parameters?: Record<string, string | number>;
}

export interface PnlData {
    time: string;
    pnl: number;
}

export interface CollectiveState {
    sentiment: Sentiment;
    lastMeetingSummary: string;
    operationalFocus: string;
    activeTaskForces: { name: string; objective: string; members: string[] }[];
}

export interface AuditLog {
    id: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    agentId?: string;
}

export interface EvolutionHistoryPoint {
    timestamp: number;
    fitness: number;
}

export interface EvolutionaryState {
    currentFitness: number;
    mutations: number;
    history: EvolutionHistoryPoint[];
    lastMutation: {
        agentId: string;
        gene: keyof Agent['genes'];
        oldValue: number;
        newValue: number;
        reason: string;
    } | null;
}

export interface SimulationResult {
    strategy: StrategyType;
    scenario: SimulationScenario;
    causalAlpha: number;
    resilienceScore: number;
    probableFutures: number;
    keyLearning: string;
    collectiveAdaptation: string;
}

export interface DataSource {
  id: string;
  type: DataSourceType;
  sourceName: string;
  status: DataSourceStatus;
  integrityScore: number;
  lastUpdated: string;
}

export interface Vote {
    agentId: string;
    decision: VoteDecision;
}

export interface ConsensusSignal {
    id: string;
    proposingAgentId: string;
    symbol: string;
    side: 'Buy' | 'Sell';
    strategy: StrategyType;
    status: ConsensusSignalStatus;
    votes: Vote[];
    eligibleVoters: string[];
    timestamp: string;
    resolvedTimestamp?: string;
}

export interface AIBoardMember {
    id: string;
    modelName: AIBoardModel;
    role: string;
    status: AIBoardMemberStatus;
}

export interface AIBoardDirective {
    id: string;
    timestamp: string;
    sourceModel: AIBoardModel;
    directive: string;
}

export interface AIBoardState {
    status: 'Nominal' | 'Elevated Alert' | 'Emergency Session';
    members: AIBoardMember[];
    directives: AIBoardDirective[];
    costProjection: number;
}

export interface QuantumAddon {
    name: string;
    code: string;
    description: string;
    status: QuantumAddonStatus;
}

export interface Prediction {
  id: string;
  symbol: string;
  horizon: '1d' | '7d' | '30d';
  decision: 'Buy' | 'Sell' | 'Hold';
  reasoning: string;
  risks: string[];
  confidence: number;
  predictedReturn: number;
  uncertainty: number;
  probabilityPositive: number;
  r_tokens: string[];
  edgeScore: number;
  passesFilters: boolean;
}

export interface BacktestResult {
    pnl: number;
    maxDrawdown: number;
    sharpeRatio: number;
    trades: number;
    equityCurve: { date: string; equity: number }[];
}

export interface ModelVote {
    modelName: AIBoardModel;
    decision: 'approve' | 'reject' | 'hold';
    confidence: number;
    reasoning: string;
    r_tokens: string[];
    risks: string[];
}

export interface BoardEvent {
    id: string;
    timestamp: string;
    agentRequest: {
        agentId: string;
        task: string;
    };
    votes: ModelVote[];
    finalDecision: ModelVote;
    consensusScore: number;
    conflictDetected: boolean;
}


export interface SystemState {
  agents: Agent[];
  strategies: Strategy[];
  pnl: number;
  drawdown: number;
  pnlHistory: PnlData[];
  circuitBreaker: {
    dailyLoss: number;
    dailyLossLimit: number;
    maxDrawdown: number;
    maxDrawdownLimit: number;
    status: 'SAFE' | 'TRIGGERED';
  };
  collectiveState: CollectiveState;
  auditLogs: AuditLog[];
  evolutionaryState: EvolutionaryState;
  consensusSignals: ConsensusSignal[];
  dataSources: DataSource[];
  aiBoardState: AIBoardState;
  quantumAddons: QuantumAddon[];
  modelRoutes: ModelRoute[];
  predictions: Prediction[];
  boardEvents: BoardEvent[];
}