import { Strategy, Mutation, HistoricalDataPoint } from '../types';

// Fitness function: Higher is better. Rewards Sharpe, penalizes Drawdown.
const calculateFitness = (sharpe: number, drawdown: number): number => {
    const drawdownPenalty = Math.abs(drawdown) * 2; // Penalize drawdown more heavily
    const fitness = (sharpe * 100) - drawdownPenalty;
    return parseFloat(fitness.toFixed(2));
};

const generateSimulatedPerformance = (sharpe: number, days: number = 60): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = [];
    let currentValue = 100;
    // Higher sharpe = higher drift. Sharpe of 1 is neutral-ish.
    const drift = (sharpe - 1) * 0.1;
    const volatility = 1.5;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        const noise = (Math.random() - 0.5) * volatility;
        currentValue += drift + noise;
        data.push({ time: date.toISOString(), value: parseFloat(currentValue.toFixed(2)) });
    }
    return data;
};

/**
 * Simulates the AI generating a new single variation of a strategy.
 * @param parentStrategy The strategy to mutate.
 * @returns A promise resolving to a new Mutation object.
 */
export const mutateStrategy = async (parentStrategy: Strategy): Promise<Mutation> => {
    await new Promise(resolve => setTimeout(resolve, 750)); // Simulate backtesting

    const sharpeChange = (Math.random() - 0.4) * 0.3; // Skewed towards positive
    const drawdownChange = (Math.random() - 0.5) * 4;

    const newSharpe = parentStrategy.sharpe + sharpeChange;
    const newDrawdown = parentStrategy.drawdown + drawdownChange;

    let status: 'outperforming' | 'performing' | 'underperforming';
    if (newSharpe > parentStrategy.sharpe * 1.05 && newDrawdown < parentStrategy.drawdown * 0.95) {
        status = 'outperforming';
    } else if (newSharpe < parentStrategy.sharpe * 0.95) {
        status = 'underperforming';
    } else {
        status = 'performing';
    }

    const lastMutation = parentStrategy.mutations?.[parentStrategy.mutations.length - 1];
    const lastGen = lastMutation?.generation || 0;

    const acronym = parentStrategy.name.split(' ').map(word => word[0]).join('');

    return {
        id: Date.now(),
        name: `${acronym}_v${(Math.random() * 10).toFixed(1)}`,
        sharpe: parseFloat(newSharpe.toFixed(2)),
        drawdown: parseFloat(newDrawdown.toFixed(2)),
        status,
        generation: lastGen + 1,
        fitness: calculateFitness(newSharpe, newDrawdown),
        horizonPerformance: generateSimulatedPerformance(newSharpe),
        statisticalEdge: 2.5 + Math.random() * 2, // Z-Score
        confidence: 0.6 + Math.random() * 0.35,
        uncertainty: 0.05 + Math.random() * 0.15,
    };
};


/**
 * Simulates a professional-grade quantitative validation pipeline.
 * Includes backtesting vs. random portfolios and Monte Carlo uncertainty quantification.
 * @param parentStrategy The parent strategy.
 * @param population The current population of mutations.
 * @returns A promise resolving to the new generation and detailed validation logs.
 */
export const evolveStrategyGeneration = async (
  parentStrategy: Strategy,
  population: Mutation[]
): Promise<{ newGeneration: Mutation[]; validationLogs: string[] }> => {
  await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate complex backtesting time

  const validationLogs: string[] = [];
  const currentGeneration =
    population.length > 0 ? Math.max(...population.map(m => m.generation)) : 0;
  const nextGeneration = currentGeneration + 1;
  const populationSize = 5;
  const STATISTICAL_EDGE_THRESHOLD = 3.0; // "Three Sigma"

  // --- SELECTION: Keep the top 2 fittest from the current population ---
  const sortedPopulation = [...population].sort((a, b) => b.fitness - a.fitness);
  const survivors = sortedPopulation.slice(0, 2);
  validationLogs.push(`Selected ${survivors.length} fittest survivors from previous generation.`);

  // --- MUTATION & RIGOROUS VALIDATION ---
  const baseForMutation = survivors.length > 0 ? survivors[0] : parentStrategy;
  const newMutations: Mutation[] = [];
  let candidatesGenerated = 0;

  validationLogs.push('Initializing new generation with advanced validation...');

  while (newMutations.length < populationSize - survivors.length && candidatesGenerated < 20) {
    candidatesGenerated++;
    const acronym = parentStrategy.name.split(' ').map(word => word[0]).join('');
    const candidateName = `${acronym}_g${nextGeneration}_v${candidatesGenerated}`;

    // 1. Simulate a backtest for the new candidate
    const backtestSharpe = baseForMutation.sharpe + (Math.random() - 0.4) * 0.5;
    const backtestDrawdown = baseForMutation.drawdown + (Math.random() - 0.5) * 5;
    validationLogs.push(`Candidate ${candidateName}: Backtest complete. Sharpe=${backtestSharpe.toFixed(2)}.`);

    // 2. Simulate comparison against random portfolios to find statistical edge
    const randomSharpes = Array.from({ length: 1000 }, () => 0.5 + Math.random() * 0.8);
    const meanRandomSharpe = randomSharpes.reduce((a, b) => a + b, 0) / randomSharpes.length;
    const stdRandomSharpe = Math.sqrt(randomSharpes.map(x => Math.pow(x - meanRandomSharpe, 2)).reduce((a, b) => a + b) / randomSharpes.length);
    const zScore = (backtestSharpe - meanRandomSharpe) / stdRandomSharpe;
    validationLogs.push(`... Comparing vs. 1,000 random portfolios (Baseline Sharpe: ${meanRandomSharpe.toFixed(2)} ± ${stdRandomSharpe.toFixed(2)}).`);

    // 3. Statistical Significance Check
    if (zScore < STATISTICAL_EDGE_THRESHOLD) {
      validationLogs.push(`... ❌ REJECTED: Statistical Edge (Z-Score) of ${zScore.toFixed(2)} is below the ${STATISTICAL_EDGE_THRESHOLD} threshold.`);
      continue;
    }
    validationLogs.push(`... ✅ ACCEPTED: Statistical Edge (Z-Score): ${zScore.toFixed(2)}.`);
    
    // 4. Simulate Monte Carlo Dropout for Uncertainty Quantification
    const confidence = 0.6 + Math.random() * 0.38; // 60% - 98%
    const uncertainty = 0.05 + (1 - confidence) * 0.5; // Higher confidence = lower uncertainty
    validationLogs.push(`... Monte Carlo analysis complete. Confidence: ${confidence.toFixed(2)}, Uncertainty: ${uncertainty.toFixed(2)}.`);

    let status: Mutation['status'];
    if (backtestSharpe > parentStrategy.sharpe * 1.05) { status = 'outperforming'; } 
    else if (backtestSharpe < parentStrategy.sharpe * 0.9) { status = 'underperforming'; }
    else { status = 'performing'; }

    newMutations.push({
      id: Date.now() + candidatesGenerated,
      name: candidateName,
      sharpe: parseFloat(backtestSharpe.toFixed(2)),
      drawdown: parseFloat(backtestDrawdown.toFixed(2)),
      status,
      generation: nextGeneration,
      fitness: calculateFitness(backtestSharpe, backtestDrawdown),
      horizonPerformance: generateSimulatedPerformance(backtestSharpe),
      statisticalEdge: parseFloat(zScore.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      uncertainty: parseFloat(uncertainty.toFixed(2)),
    });
  }

  return { 
    newGeneration: [...survivors, ...newMutations].sort((a,b) => b.fitness - a.fitness),
    validationLogs
  };
};