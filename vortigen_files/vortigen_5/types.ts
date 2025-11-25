

export type SystemStatus = 'active' | 'paused' | 'stopped' | 'emergency_stop';
export type TradingMode = 'paper' | 'live';
export type ActiveTab = 
    | 'overview' | 'agents' | 'bots' | 'agentCommand' | 'positions' | 'options'
    | 'causalAnalytics' | 'risk' | 'volatility' | 'strategyLab' | 'systemEvolution'
    | 'insights' | 'socialSentiment' | 'agentForum' | 'manifoldInspector' | 'liveAssist'
    | 'activity' | 'logSafe' | 'config' | 'workflow' | 'economicTwin' | 'aiBoard'
    | 'systemAudit';

// --- New Multi-API and Data Provider Architecture ---
export type APIProviderName = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq';
export type DataProviderName = 'alpha_vantage' | 'twelve_data' | 'polygon' | 'yahoo' | 'coingecko' | 'news_api';

export interface APIProvider {
  provider: APIProviderName;
  apiKey: string;
  model: string;
  priority: number;
  rateLimit: number; // requests per minute
  fallback: boolean;
  enabled: boolean;
}

export interface DataProvider {
  provider: DataProviderName;
  apiKey: string;
  priority: number;
  enabled: boolean;
}
// ----------------------------------------------------


export interface Position {
  symbol: string;
  qty: number;
  entryPrice: number;
  current: number;
  pnl: number;
  pnlPercent: number;
  entryTime: string;
}

export interface Greeks {
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
}

export interface OptionPosition {
    id: number;
    strategy: 'Long Straddle' | 'Short Straddle';
    underlying: string;
    strike: number;
    expiry: string;
    value: number;
    pnl: number;
    pnlPercent: number;
    greeks: Greeks;
}

export interface AiBot {
  id: string;
  name: string;
  parent: string;
  role: string;
  status: 'active' | 'standby' | 'error';
}

export interface AiAgent {
  id: string;
  name: string;
  type: 'Core' | 'Intelligence' | 'Strategy' | 'Risk' | 'Learning' | 'Research' | 'Execution';
  accuracy: number;
  latency: number;
  trades: number;
  health: number;
  bots: string[]; // List of bot names
  status: 'active' | 'paused' | 'error';
  priority: 'critical' | 'high' | 'medium' | 'low';
  workload: number; // 0-100
  config?: { 
    [key: string]: string | number | object;
    parameters?: { [key: string]: number };
  };
  // --- Circuit Breaker & Evolution ---
  errorCount: number;
  maxErrors: number;
  currentDrawdown: number;
  maxDrawdown: number;
  promptVersion: number;
  lastEvolved?: string; // ISO date string
}


export interface Insight {
  agent: string;
  text: string;
  confidence: number;
  likes: number;
  time: string;
}

export interface Activity {
  id: number;
  type: 'EXECUTION' | 'DECISION' | 'ALERT' | 'SYSTEM' | 'ERROR';
  message: string;
  agent: string;
  timestamp: string; // ISO string
  temporalAlpha?: number;
}

export interface WeeklyData {
  day: string;
  pnl: number;
}

export interface HistoricalDataPoint {
    time: string;
    value: number;
}

export interface RiskParityData {
    assetClass: string;
    weight: number;
    riskContribution: number;
    volatility: number;
}

export interface Mutation {
    id: number;
    name: string; 
    sharpe: number;
    drawdown: number;
    status: 'outperforming' | 'performing' | 'underperforming';
    generation: number; // For genetic algorithm tracking
    fitness: number; // A score combining sharpe, drawdown, etc.
    horizonPerformance?: HistoricalDataPoint[];
    // --- Advanced Quant Metrics ---
    statisticalEdge?: number; // Z-Score vs random
    confidence?: number; // 0-1, from Monte Carlo simulation
    uncertainty?: number; // 0-1, from Monte Carlo simulation
}

export interface Strategy {
    name: string;
    sharpe: number;
    drawdown: number;
    mutations: Mutation[];
    parentStrategyId?: number; // For evolution tracking
    horizonPerformance?: HistoricalDataPoint[];
}

export type SelectableItem = 
    | (Strategy & { __type: 'strategy' }) 
    | (Mutation & { __type: 'mutation'; parentName: string });


export interface ChatMessageSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
  isSearching?: boolean;
  sources?: ChatMessageSource[];
  consultationId?: number;
  isBoardConsultation?: boolean;
  boardAdvice?: BoardAdvice[];
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface LogEntry {
    id: number;
    timestamp: string;
    mediaPreviewUrl: string;
    mediaType: 'image' | 'video';
    prompt: string;
    response: string;
    saved: boolean;
}

export interface ForumPost {
  agentName: string;
  content: string;
  isPosting?: boolean;
  media?: {
    type: 'image';
    url: string;
  };
}

export interface ActionableSignal {
    ticker: string;
    direction: 'BULLISH' | 'BEARISH';
    confidence: number; // 0-100
    strategy: string;
    isHighRisk?: boolean;
    complianceProof?: string;
    proposedSizeUSD?: number;
    leverage?: number;
}

export interface ForumSummary {
  content: string;
  isPosting?: boolean;
  consensusScore?: number;
  conflictingViews?: string;
  actionableSignal?: ActionableSignal;
}

// --- Board of Directors Types ---
export type BoardModel = 'DeepSeek-R1' | 'Qwen-Max' | 'GPT-4o';

export type BoardDecision = 'approve' | 'reject' | 'buy' | 'sell' | 'hold' | 'escalate' | 'PROCEED' | 'REVISE' | 'HALT';

export interface UnifiedSchemaV2 {
    decision: BoardDecision;
    reasoning: string;
    risks: string[];
    confidence: number;
    required_actions: string[];
    r_tokens: string[]; // Reasoning Tokens
}

export interface BoardAdvice extends UnifiedSchemaV2 {
    model: BoardModel;
}

export type TaskType = 'TRADE_ADVICE' | 'EXECUTION_ADVICE' | 'REASONING' | 'LONG_CONTEXT' | 'SAFETY';

export interface BoardConsultation {
    id: number;
    agentName: string;
    request: string;
    taskType: TaskType;
    status: 'pending' | 'complete';
    timestamp: string;
    advice?: BoardAdvice[];
    routedTo?: BoardModel;
}


export type DebateStatus = 'debating' | 'synthesizing' | 'risk_review' | 'board_review' | 'ceo_approval' | 'executing' | 'complete' | 'rejected';
export type ConsensusStatus = 'pending' | 'achieved' | 'failed';

export interface ForumDebate {
  id: number;
  topic: string;
  participatingAgents: string[];
  posts: ForumPost[];
  summary: ForumSummary;
  status: 'running' | 'complete';
  debateStatus: DebateStatus;
  consensusStatus?: ConsensusStatus;
  boardReview?: BoardAdvice[];
  finalBoardDecision?: UnifiedSchemaV2;
}

export interface TrendingTicker {
    symbol: string;
    platform: 'X' | 'Reddit';
    mentions: number;
    sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface KeyNarrative {
    title: string;
    summary: string;
    source: string;
}

export interface SocialSentimentData {
    overallSentiment: number; // 0-100
    trendingTickers: TrendingTicker[];
    keyNarratives: KeyNarrative[];
    bioPsyche?: {
        cortisolEstimate: number;
        sleepDebt: number;
    }
}

// --- System Evolution Types ---
export interface StrategyPerformancePoint {
    time: string; // ISO date string
    sharpe: number;
}

export interface StrategyDecayData {
    strategyName: string;
    performance: StrategyPerformancePoint[];
    isDecaying: boolean;
}

export interface AdaptationLog {
    id: number;
    timestamp: string; // ISO date string
    agent: string;
    action: string;
}

export interface AgentAccuracyPoint {
    time: string; // ISO date string
    accuracy: number;
}

export interface AgentDriftData {
    agentName: string;
    accuracyTrend: AgentAccuracyPoint[];
}

export interface ParameterDriftLog {
    id: number;
    timestamp: string;
    agentName: string;
    parameter: string;
    oldValue: number;
    newValue: number;
    reason: string;
}

export interface AgentCommand {
    id: number;
    role: 'user' | 'agent';
    content: string;
    timestamp: string;
    isProcessing?: boolean;
}

export interface WorkflowNode {
    id: string;
    type: 'input' | 'output' | 'processing' | 'default';
    name: string;
    position: { x: number; y: number };
}

export interface Workflow {
    nodes: WorkflowNode[];
    edges: { from: string; to: string }[];
}

export interface RiskParameters {
    maxPositionSizeUSD: number;
    maxPortfolioAllocation: number;
    maxLeverage: number;
    minOrderSize: number;
    consensusThreshold: number;
}

export interface PreTradeCheckLog {
    id: number;
    timestamp: string;
    signal: ActionableSignal;
    status: 'PASS' | 'FAIL';
    reason: string;
}

// --- Agent Genome Evolution Types ---
export interface GenomeEvolutionLog {
    timestamp: string;
    message: string;
    status: 'info' | 'success' | 'error';
}

export interface AppState {
  systemStatus: SystemStatus;
  tradingMode: TradingMode;
  portfolioValue: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  positions: Position[];
  optionsPositions: OptionPosition[];
  aiAgents: AiAgent[];
  aiBots: AiBot[];
  insights: Insight[];
  activities: Activity[];
  weeklyData: WeeklyData[];
  historicalData: HistoricalDataPoint[];
  strategies: Strategy[];
  isProcessing: boolean;
  isChatOpen: boolean;
  isCommandPaletteOpen: boolean;

  chatHistory: ChatMessage[];
  isLiveSessionActive: boolean;
  transcripts: { user: string; model: string }[];
  isLiveFeedActive: boolean;
  agentHealthThreshold: number;
  logSafeEntries: LogEntry[];
  forumDebates: ForumDebate[];
  dailyBriefing: string | null;
  agentCommands: { [agentName: string]: AgentCommand[] };
  // --- New Centralized State ---
  activeTab: ActiveTab;
  agentFilter: { query: string; lowHealthOnly: boolean };
  positionFilter: { query: string };
  notification: Notification | null;

  // --- Multi-API / Data Provider State ---
  apiProviders: APIProvider[];
  dataProviders: DataProvider[];
  
  // --- New Risk & Workflow State ---
  riskParameters: RiskParameters;
  preTradeCheckLog: PreTradeCheckLog[];
  workflow: Workflow;

  // --- New Self-Learning State ---
  isAnalyzingDrift: boolean;
  parameterDriftLogs: ParameterDriftLog[];
  isEvolvingGenome: boolean;
  genomeEvolutionLogs: GenomeEvolutionLog[];
  boardConsultations: BoardConsultation[];
}

export type AppAction =
  | { type: 'SET_SYSTEM_STATUS'; payload: SystemStatus }
  | { type: 'KILL_SWITCH' }
  | { type: 'SET_TRADING_MODE'; payload: TradingMode }
  | { type: 'UPDATE_MARKET_DATA'; payload: { [symbol: string]: number } }
  | { type: 'SET_INSIGHTS', payload: Insight[] }
  | { type: 'TOGGLE_BOT_STATUS'; payload: { botId: string } }
  | { type: 'ADD_BOT'; payload: { agentName: string; bot: AiBot } }
  | { type: 'SET_HISTORICAL_DATA'; payload: HistoricalDataPoint[] }
  | { type: 'SET_PROCESSING_STATUS'; payload: boolean }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'ADD_OPTION_POSITION'; payload: OptionPosition }
  | { type: 'ADD_STRATEGY'; payload: Strategy }
  | { type: 'ADD_MUTATION'; payload: { parentStrategyName: string; mutation: Mutation } }
  | { type: 'EVOLVE_STRATEGY_GENERATION'; payload: { parentStrategyName: string; mutations: Mutation[] } }
  | { type: 'PROMOTE_MUTATION'; payload: { parentStrategyName: string; mutationId: number; newParentStrategyName: string; } }
  | { type: 'CULL_MUTATION'; payload: { parentStrategyName: string; mutationId: number } }
  | { type: 'REORDER_MUTATIONS'; payload: { parentStrategyName: string; orderedMutations: Mutation[] } }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'TOGGLE_COMMAND_PALETTE' }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_LAST_CHAT_MESSAGE'; payload: { content?: string; sources?: ChatMessageSource[] } }
  | { type: 'SET_LIVE_SESSION_STATUS'; payload: boolean }
  | { type: 'ADD_TRANSCRIPT'; payload: { user: string; model: string } }
  | { type: 'TOGGLE_LIVE_FEED' }
  | { type: 'SET_AGENT_HEALTH_THRESHOLD'; payload: number }
  | { type: 'ADD_LOG_ENTRY'; payload: Omit<LogEntry, 'id'> }
  | { type: 'TOGGLE_SAVE_LOG_ENTRY'; payload: { id: number } }
  | { type: 'DELETE_LOG_ENTRY'; payload: { id: number } }
  // --- Agent Forum Action ---
  | { type: 'ADD_FORUM_DEBATE'; payload: ForumDebate }
  | { type: 'SET_DAILY_BRIEFING'; payload: string }
  | { type: 'UPDATE_FORUM_DEBATE_STATUS'; payload: { id: number; status: DebateStatus } }
  | { type: 'ADD_BOARD_ADVICE'; payload: { debateId: number; boardReview: BoardAdvice[], finalDecision: UnifiedSchemaV2 } }
  | { type: 'APPROVE_DEBATE_SIGNAL'; payload: { id: number } }
  | { type: 'REJECT_DEBATE_SIGNAL'; payload: { id: number } }
  | { type: 'LOG_CONSENSUS_FAILURE'; payload: { debateId: number } }
  | { type: 'TOGGLE_AGENT_STATUS'; payload: { agentId: string } }
  // --- Agent Command Processor Action ---
  | { type: 'ADD_AGENT_COMMAND'; payload: { agentName: string; command: AgentCommand } }
  | { type: 'UPDATE_AGENT_COMMAND'; payload: { agentName: string; commandId: number; updates: Partial<AgentCommand> } }
  | { type: 'CLEAR_AGENT_COMMAND_HISTORY'; payload: { agentName: string } }
  // --- New Centralized Actions ---
  | { type: 'SET_ACTIVE_TAB'; payload: ActiveTab }
  | { type: 'SET_AGENT_FILTER'; payload: { query?: string; lowHealthOnly?: boolean } }
  | { type: 'SET_POSITION_FILTER'; payload: { query: string } }
  | { type: 'SHOW_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'HIDE_NOTIFICATION' }
  // --- Multi-API / Data Provider Actions ---
  | { type: 'UPDATE_API_PROVIDER'; payload: { provider: APIProviderName; apiKey: string; enabled: boolean } }
  | { type: 'UPDATE_DATA_PROVIDER'; payload: { provider: DataProviderName; apiKey: string; enabled: boolean } }
  // --- Agent Health Simulation Actions ---
  | { type: 'DEGRADE_AGENT_HEALTH' }
  | { type: 'RESET_AGENT_CIRCUIT_BREAKER', payload: { agentId: string } }
  // --- Risk Actions ---
  | { type: 'ADD_PRE_TRADE_LOG'; payload: PreTradeCheckLog }
  // --- Self-Learning Actions ---
  | { type: 'RUN_PARAMETER_DRIFT_ANALYSIS_START' }
  | { type: 'RUN_PARAMETER_DRIFT_ANALYSIS_COMPLETE'; payload: { agentId: string; newParameters: { [key: string]: number }; logs: ParameterDriftLog[] } }
  // --- Agent Genome Evolution Actions ---
  | { type: 'START_AGENT_GENOME_EVOLUTION'; payload: { agentId: string } }
  | { type: 'COMPLETE_AGENT_GENOME_EVOLUTION'; payload: { agentId: string; success: boolean; newConfig: AiAgent['config']; logs: GenomeEvolutionLog[] } }
  // --- Board Consultation Actions ---
  | { type: 'START_BOARD_CONSULTATION'; payload: Omit<BoardConsultation, 'status' | 'advice'> }
  | { type: 'COMPLETE_BOARD_CONSULTATION'; payload: { id: number; advice: BoardAdvice[]; routedTo: BoardModel } };