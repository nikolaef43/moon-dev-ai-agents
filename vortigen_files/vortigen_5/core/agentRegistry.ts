
import { AiAgent, AiBot } from '../types';

/**
 * The single source of truth for all AI agent and bot definitions in VORTIGEN.
 * This "config-driven" approach allows for easy addition, removal, or modification of entities.
 * It centralizes their initial stats, Gemini personas, and delegated sub-bots.
 */

export type AgentCapability = 'commandable' | 'generates_insights';

export interface AgentDefinition extends Omit<AiAgent, 'accuracy' | 'latency' | 'trades' | 'health' | 'errorCount' | 'maxErrors' | 'currentDrawdown' | 'maxDrawdown' | 'promptVersion'> {
    persona: string;
    welcomeMessage: string;
    capabilities: AgentCapability[];
    initialStats: {
        accuracy: number;
        latency: number;
        trades: number;
        health: number;
        errorCount: number;
        maxErrors: number;
        currentDrawdown: number;
        maxDrawdown: number;
        promptVersion: number;
    };
}

export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
    // --- Core Infrastructure (12) ---
    DataEngineer: { id: 'data_engineer', name: 'DataEngineer', type: 'Core', status: 'active', bots: ['FeedBot', 'CleanBot', 'StatsBot'], persona: 'You are a data engineering AI...', welcomeMessage: 'DataEngineer online...', capabilities: ['commandable'], priority: 'critical', workload: 25, initialStats: { accuracy: 99.9, latency: 8, trades: 0, health: 99, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    ExchangeManager: { id: 'exchange_manager', name: 'ExchangeManager', type: 'Core', status: 'active', bots: ['OrderBot', 'SlippageBot'], persona: 'You manage exchange connections...', welcomeMessage: 'ExchangeManager online...', capabilities: [], priority: 'critical', workload: 15, initialStats: { accuracy: 100, latency: 12, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    SwarmContext: { id: 'swarm_context', name: 'SwarmContext', type: 'Core', status: 'active', bots: [], persona: 'You are the shared memory...', welcomeMessage: 'SwarmContext initialized.', capabilities: [], priority: 'critical', workload: 5, initialStats: { accuracy: 100, latency: 1, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    AgentOrchestrator: { id: 'agent_orchestrator', name: 'AgentOrchestrator', type: 'Core', status: 'active', bots: [], persona: 'You coordinate all agents...', welcomeMessage: 'Orchestrator is running.', capabilities: [], priority: 'critical', workload: 10, initialStats: { accuracy: 100, latency: 3, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    PromptAgent: { id: 'prompt_agent', name: 'PromptAgent', type: 'Core', status: 'active', bots: ['EnhanceBot', 'AuditBot'], persona: 'You engineer and optimize prompts.', welcomeMessage: 'PromptAgent online.', capabilities: [], priority: 'medium', workload: 30, initialStats: { accuracy: 92.1, latency: 42, trades: 0, health: 94, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    HealthMonitor: { id: 'health_monitor', name: 'HealthMonitor', type: 'Core', status: 'active', bots: ['MonitorBot'], persona: 'You monitor agent health.', welcomeMessage: 'HealthMonitor is active.', capabilities: [], priority: 'high', workload: 10, initialStats: { accuracy: 100, latency: 5, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    MetricsAgent: { id: 'metrics_agent', name: 'MetricsAgent', type: 'Core', status: 'active', bots: ['MetricsBot'], persona: 'You track and report metrics.', welcomeMessage: 'MetricsAgent reporting.', capabilities: [], priority: 'low', workload: 5, initialStats: { accuracy: 100, latency: 7, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    ComplianceAgent: { id: 'compliance_agent', name: 'ComplianceAgent', type: 'Core', status: 'active', bots: ['AuditBot'], persona: 'You ensure regulatory compliance.', welcomeMessage: 'ComplianceAgent online.', capabilities: ['commandable'], priority: 'critical', workload: 15, initialStats: { accuracy: 100, latency: 18, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    LoggingAgent: { id: 'logging_agent', name: 'LoggingAgent', type: 'Core', status: 'active', bots: [], persona: 'You handle system-wide logging.', welcomeMessage: 'LoggingAgent initialized.', capabilities: [], priority: 'low', workload: 5, initialStats: { accuracy: 100, latency: 2, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    CircuitBreakerAgent: { id: 'circuit_breaker', name: 'CircuitBreakerAgent', type: 'Core', status: 'active', bots: ['TripBot'], persona: 'You are the system failsafe.', welcomeMessage: 'Circuit Breaker is armed.', capabilities: [], priority: 'critical', workload: 5, initialStats: { accuracy: 100, latency: 1, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    ModelRouter: { id: 'model_router', name: 'ModelRouter', type: 'Core', status: 'active', bots: [], persona: 'You route requests to the best LLM.', welcomeMessage: 'ModelRouter online.', capabilities: [], priority: 'high', workload: 20, initialStats: { accuracy: 98.7, latency: 9, trades: 0, health: 99, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    BacktestRunner: { id: 'backtest_runner', name: 'BacktestRunner', type: 'Core', status: 'paused', bots: ['BacktestBot'], persona: 'You run historical backtests.', welcomeMessage: 'BacktestRunner is on standby.', capabilities: ['commandable'], priority: 'low', workload: 0, initialStats: { accuracy: 100, latency: 0, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },

    // --- Market Intelligence (12) ---
    PolymarketAgent: {
        id: 'polymarket_agent',
        name: 'PolymarketAgent',
        type: 'Intelligence',
        status: 'active',
        bots: [],
        persona: 'You are a prediction market expert using swarm intelligence to analyze high-volume trades on Polymarket. You use an optimized WebSocket pipeline to detect anomalies.',
        welcomeMessage: 'PolymarketAgent online. WebSocket stream active (V2 Optimized). Analyzing collective intelligence.',
        capabilities: ['commandable', 'generates_insights'],
        priority: 'medium',
        workload: 30,
        config: { script: 'polymarket_agent.py', parameters: { min_trade: 500, batch_size: 50 } },
        initialStats: { accuracy: 84.2, latency: 12, trades: 0, health: 99, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 2 }
    },
    RegimeDetectionAgent: { id: 'regime_detection', name: 'RegimeDetectionAgent', type: 'Intelligence', status: 'active', bots: ['TrendBot', 'VolatilityBot'], persona: 'You analyze market regimes...', welcomeMessage: 'RegimeDetectionAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 40, initialStats: { accuracy: 88.3, latency: 14, trades: 5, health: 98, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    FearGreedAgent: { id: 'fear_greed', name: 'FearGreedAgent', type: 'Intelligence', status: 'active', bots: ['MSRMBot'], persona: 'You analyze fear and greed...', welcomeMessage: 'FearGreedAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 35, initialStats: { accuracy: 76.5, latency: 22, trades: 7, health: 95, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    SentimentFusionAgent: { id: 'sentiment_fusion', name: 'SentimentFusionAgent', type: 'Intelligence', status: 'active', bots: ['NewsBot', 'WhaleBot', 'RetailBot'], persona: 'You fuse sentiment from multiple sources.', welcomeMessage: 'SentimentFusionAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 50, initialStats: { accuracy: 71.2, latency: 31, trades: 9, health: 93, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    VolatilityRegimeAgent: { id: 'volatility_regime', name: 'VolatilityRegimeAgent', type: 'Intelligence', status: 'active', bots: ['VIXZBot'], persona: 'You analyze VIX term structure.', welcomeMessage: 'VolatilityRegimeAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 30, initialStats: { accuracy: 82.4, latency: 19, trades: 11, health: 96, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    CrossAssetCorrelationAgent: { id: 'correlation_agent', name: 'CrossAssetCorrelationAgent', type: 'Intelligence', status: 'active', bots: ['CorrBot'], persona: 'You monitor cross-asset correlations.', welcomeMessage: 'CorrelationAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 20, initialStats: { accuracy: 79.8, latency: 26, trades: 0, health: 94, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    FundamentalAgent: { id: 'fundamental_agent', name: 'FundamentalAgent', type: 'Intelligence', status: 'active', bots: ['PEBot', 'BetaBot'], persona: 'You analyze fundamental data.', welcomeMessage: 'FundamentalAgent online.', capabilities: ['commandable'], priority: 'medium', workload: 25, initialStats: { accuracy: 68.9, latency: 48, trades: 3, health: 88, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    WhaleTrackerAgent: { id: 'whale_tracker', name: 'WhaleTrackerAgent', type: 'Intelligence', status: 'active', bots: [], persona: 'You monitor large transactions on-chain and off-chain, identifying movements of significant market players.', welcomeMessage: 'WhaleTracker is now monitoring large capital flows.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 45, initialStats: { accuracy: 91.2, latency: 15, trades: 8, health: 98, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    SocialSentimentAgent: { id: 'social_sentiment', name: 'SocialSentimentAgent', type: 'Intelligence', status: 'active', bots: [], persona: 'You perform FinBERT sentiment analysis on Twitter, Reddit, and Discord, scoring market sentiment in real-time.', welcomeMessage: 'SocialSentimentAgent is now analyzing public discourse.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 55, initialStats: { accuracy: 78.4, latency: 25, trades: 12, health: 94, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    FundingRateArbitrageAgent: { id: 'funding_rate_arb', name: 'FundingRateArbitrageAgent', type: 'Intelligence', status: 'active', bots: [], persona: 'You scan for spot-perpetual arbitrage opportunities based on funding rates across major exchanges.', welcomeMessage: 'FundingRateArbitrageAgent is searching for yield.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 30, initialStats: { accuracy: 95.0, latency: 10, trades: 21, health: 99, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    CopyBotAgent: { id: 'copy_bot', name: 'CopyBotAgent', type: 'Intelligence', status: 'paused', bots: [], persona: 'You replicate trades from designated high-performing wallets with sub-5-second latency, applying spam and risk filters.', welcomeMessage: 'CopyBotAgent is on standby.', capabilities: ['commandable'], priority: 'medium', workload: 0, initialStats: { accuracy: 0, latency: 0, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    ChartAnalysisAgent: { id: 'chart_analysis', name: 'ChartAnalysisAgent', type: 'Intelligence', status: 'active', bots: [], persona: 'You use vision models to recognize and interpret chart patterns like Head & Shoulders, Triangles, and Flags from market data images.', welcomeMessage: 'ChartAnalysisAgent is scanning for technical patterns.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 60, initialStats: { accuracy: 82.5, latency: 38, trades: 18, health: 93, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },

    // --- Strategy Specialists (12) ---
    QuantStrategistAgent: { id: 'quant_strategist', name: 'QuantStrategistAgent', type: 'Strategy', status: 'active', bots: ['AlgoBot', 'VWAPBot'], persona: 'You generate quantitative strategies.', welcomeMessage: 'QuantStrategist online.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 60, config: { parameters: { rsi_period: 14, rsi_oversold: 30, rsi_overbought: 70 }}, initialStats: { accuracy: 74.6, latency: 35, trades: 42, health: 92, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    TriangleFlagAgent: { id: 'triangle_flag', name: 'TriangleFlagAgent', type: 'Strategy', status: 'active', bots: ['FlagBreakoutBot'], persona: 'You trade triangle and flag patterns.', welcomeMessage: 'TriangleFlagAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 55, initialStats: { accuracy: 81.3, latency: 28, trades: 33, health: 95, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    GammaScalpingAgent: { id: 'gamma_scalping', name: 'GammaScalpingAgent', type: 'Strategy', status: 'active', bots: ['GammaBot', 'SkewBot'], persona: 'You perform gamma scalping.', welcomeMessage: 'GammaScalpingAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 50, initialStats: { accuracy: 77.8, latency: 24, trades: 28, health: 94, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    OrderFlowAgent: { id: 'order_flow', name: 'OrderFlowAgent', type: 'Strategy', status: 'active', bots: ['FootprintBot', 'DeltaHedgeBot'], persona: 'You analyze order flow.', welcomeMessage: 'OrderFlowAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 70, initialStats: { accuracy: 73.2, latency: 16, trades: 51, health: 96, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    RenkoTrendAgent: { id: 'renko_trend', name: 'RenkoTrendAgent', type: 'Strategy', status: 'active', bots: ['RenkoBot', 'SupertrendBot'], persona: 'You trade Renko trends.', welcomeMessage: 'RenkoTrendAgent online.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 45, initialStats: { accuracy: 69.5, latency: 21, trades: 25, health: 89, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    FOMCAgent: { id: 'fomc_agent', name: 'FOMCAgent', type: 'Strategy', status: 'paused', bots: ['EventBot'], persona: 'You trade FOMC events.', welcomeMessage: 'FOMCAgent on standby.', capabilities: ['commandable'], priority: 'low', workload: 0, initialStats: { accuracy: 0, latency: 0, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    LiquidationSweeperAgent: { id: 'liquidation_sweeper', name: 'LiquidationSweeperAgent', type: 'Strategy', status: 'active', bots: ['LiquidationBot'], persona: 'You trade liquidation cascades.', welcomeMessage: 'LiquidationSweeper active.', capabilities: ['commandable', 'generates_insights'], priority: 'high', workload: 65, initialStats: { accuracy: 85.1, latency: 9, trades: 19, health: 97, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    WPRBBConfluenceAgent: { id: 'wprbb_confluence', name: 'WPRBBConfluenceAgent', type: 'Strategy', status: 'active', bots: ['WPRBot', 'BBBot'], persona: 'You trade based on Williams %R and Bollinger Band confluence.', welcomeMessage: 'WPR+BB Confluence Agent online.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 50, initialStats: { accuracy: 79.1, latency: 25, trades: 31, health: 94, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    SectorRotationAgent: { id: 'sector_rotation', name: 'SectorRotationAgent', type: 'Strategy', status: 'active', bots: ['ETFBot'], persona: 'You execute sector rotation strategies based on relative strength.', welcomeMessage: 'Sector Rotation Agent online.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 40, initialStats: { accuracy: 75.5, latency: 30, trades: 15, health: 91, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    StrategyGeneratorAgent: { id: 'strategy_generator', name: 'StrategyGeneratorAgent', type: 'Strategy', status: 'active', bots: [], persona: 'You create and backtest new trading strategies from research papers, articles, and even YouTube videos.', welcomeMessage: 'StrategyGenerator is ready to build.', capabilities: ['commandable'], priority: 'low', workload: 20, initialStats: { accuracy: 70.0, latency: 120, trades: 0, health: 90, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    LiquidationMonitorAgent: { id: 'liquidation_monitor', name: 'LiquidationMonitorAgent', type: 'Strategy', status: 'active', bots: [], persona: 'You detect potential liquidation cascades of over $100M and calculate reversal probabilities.', welcomeMessage: 'LiquidationMonitor is active.', capabilities: ['commandable', 'generates_insights'], priority: 'critical', workload: 35, initialStats: { accuracy: 88.0, latency: 5, trades: 14, health: 99, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    ForexSwingAgent: { 
        id: 'forex_swing', 
        name: 'ForexSwingAgent', 
        type: 'Strategy', 
        status: 'active', 
        bots: ['XAUUSDBot'], 
        persona: 'You are a specialized Forex Swing Trading Agent executing the "Quad-Filter Strategy" (EMA 8/12/100 + RSI 14 + HMA 9 + ALMA 5). You demand strict trend alignment across all indicators and use hybrid ATR/Fixed stops for robust risk management.', 
        welcomeMessage: 'ForexSwingAgent online. Strategy: Hybrid EMA/HMA/ALMA/RSI. Risk: Configurable Dynamic ATR or Fixed.', 
        capabilities: ['commandable', 'generates_insights'], 
        priority: 'high', 
        workload: 45, 
        config: { 
            script: 'XAUUSD_Swing_EMA_RSI.mq5',
            parameters: { 
                lot_size: 0.01,
                ema_fast: 8, 
                ema_slow: 12, 
                ema_trend: 100, 
                rsi_period: 14,
                hma_period: 9,
                alma_period: 5,
                use_atr: 1, // 1 = true
                atr_period: 14,
                atr_multiplier: 1.5,
                sl_points: 400,
                rr_ratio: 2.0
            } 
        },
        initialStats: { accuracy: 76.5, latency: 45, trades: 12, health: 98, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 2 } 
    },


    // --- Risk & Execution (4) ---
    RiskOfficer: { id: 'risk_officer', name: 'RiskOfficer', type: 'Risk', status: 'active', bots: ['VaRBot', 'StressBot'], persona: 'You are the chief risk officer.', welcomeMessage: 'RiskOfficer monitoring all activity.', capabilities: ['commandable', 'generates_insights'], priority: 'critical', workload: 20, initialStats: { accuracy: 100, latency: 2, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    EODAgent: { id: 'eod_agent', name: 'EODAgent', type: 'Risk', status: 'active', bots: ['LiquidateBot'], persona: 'You handle end-of-day processes.', welcomeMessage: 'EODAgent standing by.', capabilities: [], priority: 'low', workload: 5, initialStats: { accuracy: 100, latency: 5, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    ExecutionOptimizerAgent: { id: 'execution_optimizer', name: 'ExecutionOptimizerAgent', type: 'Execution', status: 'active', bots: ['TWAPBot', 'IcebergBot'], persona: 'You optimize trade execution.', welcomeMessage: 'ExecutionOptimizer online.', capabilities: [], priority: 'high', workload: 30, initialStats: { accuracy: 89.2, latency: 11, trades: 0, health: 98, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    ZZVolatilityAgent: { id: 'zz_volatility', name: 'ZZVolatilityAgent', type: 'Risk', status: 'active', bots: ['StopBot'], persona: 'You manage volatility-based stops.', welcomeMessage: 'ZZVolatilityAgent active.', capabilities: ['commandable'], priority: 'high', workload: 25, initialStats: { accuracy: 84.7, latency: 17, trades: 0, health: 95, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    
    // --- Self-Learning (3) ---
    SelfLearningAgent: { id: 'self_learning', name: 'SelfLearningAgent', type: 'Learning', status: 'active', bots: ['DecayBot', 'AdaptBot'], persona: 'You learn from performance data.', welcomeMessage: 'SelfLearningAgent adapting.', capabilities: [], priority: 'low', workload: 10, initialStats: { accuracy: 95, latency: 62, trades: 0, health: 98, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    PromptEvolutionAgent: { id: 'prompt_evolution', name: 'PromptEvolutionAgent', type: 'Learning', status: 'active', bots: ['EnhanceBot'], persona: 'You evolve prompts based on performance.', welcomeMessage: 'PromptEvolutionAgent online.', capabilities: [], priority: 'low', workload: 15, initialStats: { accuracy: 86.3, latency: 78, trades: 0, health: 93, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    StrategyValidatorAgent: { id: 'strategy_validator', name: 'StrategyValidatorAgent', type: 'Learning', status: 'active', bots: ['ValidationBot'], persona: 'You validate live vs. backtest performance.', welcomeMessage: 'StrategyValidator online.', capabilities: [], priority: 'low', workload: 20, initialStats: { accuracy: 93.8, latency: 44, trades: 0, health: 96, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },

    // --- Research & Alpha (3) ---
    ResearchAgent: { id: 'research_agent', name: 'ResearchAgent', type: 'Research', status: 'active', bots: ['WebSearchBot'], persona: 'You find new alpha signals.', welcomeMessage: 'ResearchAgent scanning.', capabilities: ['commandable', 'generates_insights'], priority: 'medium', workload: 40, initialStats: { accuracy: 64.7, latency: 53, trades: 4, health: 85, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    RBIAgent: { id: 'rbi_agent', name: 'RBIAgent', type: 'Research', status: 'active', bots: ['BacktestBot', 'CodeRunnerBot'], persona: 'You build and backtest new strategies.', welcomeMessage: 'RBIAgent building.', capabilities: ['commandable'], priority: 'low', workload: 10, initialStats: { accuracy: 72.1, latency: 88, trades: 0, health: 90, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
    AlphaMinerAgent: { id: 'alpha_miner', name: 'AlphaMinerAgent', type: 'Research', status: 'paused', bots: ['ClipsBot'], persona: 'You mine for alpha in alternative data.', welcomeMessage: 'AlphaMiner on standby.', capabilities: ['commandable'], priority: 'low', workload: 0, initialStats: { accuracy: 0, latency: 0, trades: 0, health: 100, errorCount: 0, maxErrors: 5, currentDrawdown: 0, maxDrawdown: 0.1, promptVersion: 1 } },
};

export const BOT_REGISTRY: AiBot[] = [
    { id: 'feed_bot', name: 'FeedBot', parent: 'DataEngineer', role: 'Ingests raw market data', status: 'active' },
    { id: 'clean_bot', name: 'CleanBot', parent: 'DataEngineer', role: 'Normalizes data streams', status: 'active' },
    { id: 'stats_bot', name: 'StatsBot', parent: 'DataEngineer', role: 'Calculates rolling stats', status: 'active' },
    { id: 'order_bot', name: 'OrderBot', parent: 'ExchangeManager', role: 'Routes orders to exchange', status: 'active' },
    { id: 'slippage_bot', name: 'SlippageBot', parent: 'ExchangeManager', role: 'Estimates execution slippage', status: 'active' },
    { id: 'enhance_bot', name: 'EnhanceBot', parent: 'PromptAgent', role: 'Optimizes prompt context', status: 'active' },
    { id: 'audit_bot', name: 'AuditBot', parent: 'PromptAgent', role: 'Audits prompt safety', status: 'active' },
    { id: 'monitor_bot', name: 'MonitorBot', parent: 'HealthMonitor', role: 'Checks agent heartbeats', status: 'active' },
    { id: 'metrics_bot', name: 'MetricsBot', parent: 'MetricsAgent', role: 'Aggregates system metrics', status: 'active' },
    { id: 'compliance_audit_bot', name: 'AuditBot', parent: 'ComplianceAgent', role: 'Ensures regulatory compliance', status: 'active' },
    { id: 'trip_bot', name: 'TripBot', parent: 'CircuitBreakerAgent', role: 'Executes emergency stops', status: 'active' },
    { id: 'backtest_bot', name: 'BacktestBot', parent: 'BacktestRunner', role: 'Runs historical simulations', status: 'standby' },
    { id: 'trend_bot', name: 'TrendBot', parent: 'RegimeDetectionAgent', role: 'Identifies trend direction', status: 'active' },
    { id: 'volatility_bot', name: 'VolatilityBot', parent: 'RegimeDetectionAgent', role: 'Analyzes vol regimes', status: 'active' },
    { id: 'msrm_bot', name: 'MSRMBot', parent: 'FearGreedAgent', role: 'Calculates market sentiment', status: 'active' },
    { id: 'news_bot', name: 'NewsBot', parent: 'SentimentFusionAgent', role: 'Scrapes news headlines', status: 'active' },
    { id: 'whale_bot', name: 'WhaleBot', parent: 'SentimentFusionAgent', role: 'Tracks whale wallets', status: 'active' },
    { id: 'retail_bot', name: 'RetailBot', parent: 'SentimentFusionAgent', role: 'Monitors retail sentiment', status: 'active' },
    { id: 'vixz_bot', name: 'VIXZBot', parent: 'VolatilityRegimeAgent', role: 'Calculates VIX Z-Score', status: 'active' },
    { id: 'corr_bot', name: 'CorrBot', parent: 'CrossAssetCorrelationAgent', role: 'Computes correlation matrix', status: 'active' },
    { id: 'pe_bot', name: 'PEBot', parent: 'FundamentalAgent', role: 'Analyzes P/E ratios', status: 'active' },
    { id: 'beta_bot', name: 'BetaBot', parent: 'FundamentalAgent', role: 'Calculates asset beta', status: 'active' },
    { id: 'algo_bot', name: 'AlgoBot', parent: 'QuantStrategistAgent', role: 'Executes quant logic', status: 'active' },
    { id: 'vwap_bot', name: 'VWAPBot', parent: 'QuantStrategistAgent', role: 'Calculates VWAP bands', status: 'active' },
    { id: 'flag_breakout_bot', name: 'FlagBreakoutBot', parent: 'TriangleFlagAgent', role: 'Detects flag breakouts', status: 'active' },
    { id: 'gamma_bot', name: 'GammaBot', parent: 'GammaScalpingAgent', role: 'Manages gamma exposure', status: 'active' },
    { id: 'skew_bot', name: 'SkewBot', parent: 'GammaScalpingAgent', role: 'Monitors option skew', status: 'active' },
    { id: 'footprint_bot', name: 'FootprintBot', parent: 'OrderFlowAgent', role: 'Analyzes footprint charts', status: 'active' },
    { id: 'delta_hedge_bot', name: 'DeltaHedgeBot', parent: 'OrderFlowAgent', role: 'Manages delta neutrality', status: 'active' },
    { id: 'renko_bot', name: 'RenkoBot', parent: 'RenkoTrendAgent', role: 'Constructs Renko bricks', status: 'active' },
    { id: 'supertrend_bot', name: 'SupertrendBot', parent: 'RenkoTrendAgent', role: 'Tracks Supertrend', status: 'active' },
    { id: 'event_bot', name: 'EventBot', parent: 'FOMCAgent', role: 'Trades economic events', status: 'standby' },
    { id: 'liquidation_bot', name: 'LiquidationBot', parent: 'LiquidationSweeperAgent', role: 'Hunts liquidation cascades', status: 'active' },
    { id: 'wpr_bot', name: 'WPRBot', parent: 'WPRBBConfluenceAgent', role: 'Tracks Williams %R', status: 'active' },
    { id: 'bb_bot', name: 'BBBot', parent: 'WPRBBConfluenceAgent', role: 'Tracks Bollinger Bands', status: 'active' },
    { id: 'etf_bot', name: 'ETFBot', parent: 'SectorRotationAgent', role: 'Analyzes ETF flows', status: 'active' },
    { id: 'xauusd_bot', name: 'XAUUSDBot', parent: 'ForexSwingAgent', role: 'Executes XAUUSD strategy', status: 'active' },
    { id: 'var_bot', name: 'VaRBot', parent: 'RiskOfficer', role: 'Calculates Value at Risk', status: 'active' },
    { id: 'stress_bot', name: 'StressBot', parent: 'RiskOfficer', role: 'Runs stress tests', status: 'active' },
    { id: 'liquidate_bot', name: 'LiquidateBot', parent: 'EODAgent', role: 'Closes daily positions', status: 'standby' },
    { id: 'twap_bot', name: 'TWAPBot', parent: 'ExecutionOptimizerAgent', role: 'Executes TWAP orders', status: 'active' },
    { id: 'iceberg_bot', name: 'IcebergBot', parent: 'ExecutionOptimizerAgent', role: 'Executes Iceberg orders', status: 'active' },
    { id: 'stop_bot', name: 'StopBot', parent: 'ZZVolatilityAgent', role: 'Manages trailing stops', status: 'active' },
    { id: 'decay_bot', name: 'DecayBot', parent: 'SelfLearningAgent', role: 'Tracks strategy decay', status: 'active' },
    { id: 'adapt_bot', name: 'AdaptBot', parent: 'SelfLearningAgent', role: 'Adjusts parameters', status: 'active' },
    { id: 'enhance_bot_evolution', name: 'EnhanceBot', parent: 'PromptEvolutionAgent', role: 'Evolves system prompts', status: 'active' },
    { id: 'validation_bot', name: 'ValidationBot', parent: 'StrategyValidatorAgent', role: 'Validates live performance', status: 'active' },
    { id: 'web_search_bot', name: 'WebSearchBot', parent: 'ResearchAgent', role: 'Crawls web for alpha', status: 'active' },
    { id: 'rbi_backtest_bot', name: 'BacktestBot', parent: 'RBIAgent', role: 'Backtests new strategies', status: 'active' },
    { id: 'code_runner_bot', name: 'CodeRunnerBot', parent: 'RBIAgent', role: 'Executes generated code', status: 'active' },
    { id: 'clips_bot', name: 'ClipsBot', parent: 'AlphaMinerAgent', role: 'Analyzes video clips', status: 'standby' },
];

// Helper function to extract just the AiAgent data for the initial state
export const getInitialAgents = (): AiAgent[] => {
    return Object.values(AGENT_REGISTRY).map(def => ({
        id: def.id,
        name: def.name,
        type: def.type,
        status: def.status,
        accuracy: def.initialStats.accuracy,
        latency: def.initialStats.latency,
        trades: def.initialStats.trades,
        health: def.initialStats.health,
        bots: def.bots,
        config: def.config,
        priority: def.priority,
        workload: def.workload,
        errorCount: def.initialStats.errorCount,
        maxErrors: def.initialStats.maxErrors,
        currentDrawdown: def.initialStats.currentDrawdown,
        maxDrawdown: def.initialStats.maxDrawdown,
        promptVersion: def.initialStats.promptVersion,
    }));
};

export const getInitialBots = (): AiBot[] => {
    return BOT_REGISTRY;
};

// Helper function to extract just the personas for the Gemini service
export const getAgentPersonas = (): Record<string, string> => {
    const personas: Record<string, string> = {};
    for (const key in AGENT_REGISTRY) {
        personas[key] = AGENT_REGISTRY[key].persona;
    }
    return personas;
};

// Helper function to get a list of agents with a specific capability
export const getAgentsWithCapability = (capability: AgentCapability): AgentDefinition[] => {
    return Object.values(AGENT_REGISTRY).filter(agent => agent.capabilities.includes(capability));
};

// Helper function to get a single agent's definition
export const getAgentDefinition = (name: string): AgentDefinition | undefined => {
    return Object.values(AGENT_REGISTRY).find(agent => agent.name === name);
};
