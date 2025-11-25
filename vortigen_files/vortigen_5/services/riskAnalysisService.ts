import { AiAgent } from "../types";

export interface VaRResult {
    confidence: number;
    loss: number;
}

export interface StressTestResult {
    scenario: string;
    pnlImpact: number;
    pnlImpactPercent: number;
}

export interface AgentRiskResult {
    name: string;
    riskContribution: number;
}

/**
 * Simulates calculating Value at Risk (VaR).
 * @param portfolioValue The total value of the portfolio.
 * @returns A promise resolving to an array of VaR results.
 */
export const calculateVaR = async (portfolioValue: number): Promise<VaRResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate calculation delay
    return [
        { confidence: 90, loss: portfolioValue * 0.025 },
        { confidence: 95, loss: portfolioValue * 0.041 },
        { confidence: 99, loss: portfolioValue * 0.072 },
    ];
};

/**
 * Simulates running various stress tests on the portfolio.
 * @param portfolioValue The total value of the portfolio.
 * @returns A promise resolving to an array of stress test results.
 */
export const runStressTests = async (portfolioValue: number): Promise<StressTestResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { scenario: 'Market Crash (-20%)', pnlImpact: -portfolioValue * 0.18, pnlImpactPercent: -18.0 },
        { scenario: 'Interest Rate Hike (+2%)', pnlImpact: -portfolioValue * 0.03, pnlImpactPercent: -3.0 },
        { scenario: 'Crypto Volatility Spike', pnlImpact: -portfolioValue * 0.09, pnlImpactPercent: -9.0 },
        { scenario: 'Flash Crash', pnlImpact: -portfolioValue * 0.11, pnlImpactPercent: -11.0 },
    ];
};

/**
 * Simulates calculating the risk contribution of each agent.
 */
export const calculateAgentRisk = async (agents: AiAgent[]): Promise<AgentRiskResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const tradingAgents = agents.filter(a => a.trades && a.trades > 0);
  if (tradingAgents.length === 0) return [];

  // compute a simple mock risk score and normalize
  const raw = tradingAgents.map(agent => {
    const accuracyFactor = Math.max(agent.accuracy, 1); // avoid zero
    const latencyFactor = Math.max(agent.latency, 1);
    const tradesFactor = Math.max(agent.trades, 1);
    const risk = tradesFactor * (latencyFactor / 100) * (1 / (accuracyFactor / 100));
    return { name: agent.name, rawRisk: risk };
  });

  const totalRaw = raw.reduce((s, r) => s + r.rawRisk, 0) || 1;

  const normalized = raw.map(r => ({
    name: r.name,
    riskContribution: (r.rawRisk / totalRaw) * 100
  }));

  return normalized.sort((a, b) => b.riskContribution - a.riskContribution);
};
