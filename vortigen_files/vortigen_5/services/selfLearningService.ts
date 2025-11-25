
import { StrategyDecayData, AdaptationLog, AgentDriftData, AiAgent, ParameterDriftLog, GenomeEvolutionLog } from '../types';

// --- MOCK DATA GENERATION for the SelfLearningAgent ---

/**
 * Generates realistic-looking performance decay data for strategies.
 * @returns A promise resolving to an array of strategy decay data.
 */
export const fetchStrategyDecayData = async (): Promise<StrategyDecayData[]> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate calculation

    const generatePerformance = (startSharpe: number, isDecaying: boolean) => {
        const data = [];
        let currentSharpe = startSharpe;
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const noise = (Math.random() - 0.5) * 0.1;
            const decayFactor = isDecaying ? (i / 30) * -0.02 : 0;
            currentSharpe += noise + decayFactor;
            data.push({ time: date.toISOString(), sharpe: parseFloat(currentSharpe.toFixed(2)) });
        }
        return data;
    };

    return [
        {
            strategyName: 'Intraday Momentum v1.3',
            performance: generatePerformance(2.15, false),
            isDecaying: false
        },
        {
            strategyName: 'Sector Rotation',
            performance: generatePerformance(2.05, true),
            isDecaying: true
        }
    ];
};

/**
 * Generates mock adaptation logs from the AdaptBot.
 * @returns A promise resolving to an array of adaptation logs.
 */
export const fetchAdaptationLogs = async (): Promise<AdaptationLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
        { id: 1, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), agent: 'AdaptBot', action: "Increased risk parameter for 'QuantStrategist' based on rising VIX." },
        { id: 2, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), agent: 'AdaptBot', action: "Reduced weight for 'Sector Rotation' strategy due to performance decay." },
        { id: 3, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), agent: 'AdaptBot', action: "Activated 'HedgingBot' in RiskOfficer due to high market correlation." },
        { id: 4, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), agent: 'AdaptBot', action: "Increased data lookback window for 'FundamentalAgent' to 90 days." },
    ];
};


/**
 * Generates mock accuracy drift data for key agents.
 * @returns A promise resolving to an array of agent drift data.
 */
export const fetchAgentAccuracyDrift = async (): Promise<AgentDriftData[]> => {
     await new Promise(resolve => setTimeout(resolve, 500));
     
     const generateAccuracy = (startAcc: number, hasDrift: boolean) => {
        const data = [];
        let currentAcc = startAcc;
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const noise = (Math.random() - 0.5) * 0.5;
            const driftFactor = hasDrift ? (i / 30) * -0.1 : 0;
            currentAcc += noise + driftFactor;
            currentAcc = Math.max(80, Math.min(99, currentAcc)); // Clamp between 80-99
            data.push({ time: date.toISOString(), accuracy: parseFloat(currentAcc.toFixed(2)) });
        }
        return data;
    };

    return [
        {
            agentName: 'QuantStrategist',
            accuracyTrend: generateAccuracy(94.2, false)
        },
        {
            agentName: 'ResearchAgent',
            accuracyTrend: generateAccuracy(91.5, true)
        }
    ]
};

/**
 * Simulates the SelfLearningAgent running a parameter drift analysis.
 */
export const runParameterDriftAnalysis = async (
    agents: AiAgent[]
): Promise<{ agentId: string; newParameters: { [key: string]: number }; logs: ParameterDriftLog[] } | null> => {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate heavy computation

    const targetAgent = agents.find(a => a.name === 'QuantStrategistAgent' && a.config?.parameters);
    if (!targetAgent || !targetAgent.config?.parameters) {
        return null;
    }

    const logs: ParameterDriftLog[] = [];
    const oldRsiPeriod = targetAgent.config.parameters.rsi_period || 14;

    // Simulate analysis
    const livePerformanceSharpe = 1.75 + (Math.random() - 0.5) * 0.2; // Recent "live" performance
    const newRsiPeriod = oldRsiPeriod === 14 ? 16 : 14;
    const backtestPerformanceSharpe = livePerformanceSharpe + (0.1 + Math.random() * 0.2); // New backtest is better

    logs.push({
        id: Date.now() + 1,
        timestamp: new Date().toISOString(),
        agentName: targetAgent.name,
        parameter: 'rsi_period',
        oldValue: oldRsiPeriod,
        newValue: newRsiPeriod,
        reason: `Live performance (Sharpe ${livePerformanceSharpe.toFixed(2)}) underperformed backtest with new parameter (Sharpe ${backtestPerformanceSharpe.toFixed(2)}).`
    });

    if (backtestPerformanceSharpe > livePerformanceSharpe * 1.05) { // Only update if significantly better
         return {
            agentId: targetAgent.id,
            newParameters: { ...targetAgent.config.parameters, rsi_period: newRsiPeriod },
            logs
        };
    }
    
    // If no improvement, just log the check
    logs[0].reason = `Live performance (Sharpe ${livePerformanceSharpe.toFixed(2)}) is optimal. No change needed for 'rsi_period'.`;
    logs[0].newValue = oldRsiPeriod;
    
    return {
        agentId: targetAgent.id,
        newParameters: { ...targetAgent.config.parameters },
        logs
    };
};

/**
 * Simulates the Metamorphic Code Genesis Core (MCGC) evolving an agent's core logic.
 */
export const runAgentGenomeEvolution = async (
    agent: AiAgent
): Promise<{ success: boolean; newConfig: AiAgent['config']; logs: GenomeEvolutionLog[] }> => {
    const logs: GenomeEvolutionLog[] = [];
    const log = (message: string, status: GenomeEvolutionLog['status'] = 'info') => {
        logs.push({ timestamp: new Date().toISOString(), message, status });
    };

    log(`Initializing genome evolution for Agent '${agent.name}' (v${agent.promptVersion})...`);
    await new Promise(res => setTimeout(res, 500));

    log('Analyzing agent performance metrics and error logs...');
    await new Promise(res => setTimeout(res, 1000));
    // Simulate finding an area for improvement
    const improvementArea = agent.type === 'Strategy' ? 'risk management parameters' : 'data processing pipeline';
    log(`Identified potential improvement area: ${improvementArea}.`);

    log('Generating new genome candidate (prompt/logic patch)...');
    await new Promise(res => setTimeout(res, 1500));
    log(`Genome candidate v${agent.promptVersion + 1}-candidate.1 generated.`);

    log('Running back-propagation validation and counter-factual simulation...');
    const success = Math.random() > 0.2; // 80% success rate
    await new Promise(res => setTimeout(res, 2000));

    if (success) {
        log('Validation successful. Projected accuracy increase: +1.5%.', 'success');
        await new Promise(res => setTimeout(res, 500));
        log('Hot-swapping agent core logic... New version is now live.', 'success');
        
        // Simulate a config change, e.g., adding a new parameter
        const newConfig = { ...agent.config };
        if (agent.name === 'QuantStrategistAgent') {
            (newConfig as any).parameters.ema_fast_period = 12; // Add a new parameter
        }
        
        return { success: true, newConfig, logs };
    } else {
        log('Validation failed. Candidate performance was suboptimal.', 'error');
        await new Promise(res => setTimeout(res, 500));
        log('Discarding candidate. Reverting to current stable version.', 'error');
        return { success: false, newConfig: agent.config, logs };
    }
};
