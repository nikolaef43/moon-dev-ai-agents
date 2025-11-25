import { OptionPosition, Greeks } from '../types';

/**
 * Simulates calculating the greeks for a new option position.
 * @param strategyType The type of strategy ('Long Straddle' or 'Short Straddle').
 * @returns A mock Greeks object.
 */
const mockCalculateGreeks = (strategyType: 'Long Straddle' | 'Short Straddle'): Greeks => {
    const sign = strategyType === 'Long Straddle' ? 1 : -1;
    return {
        delta: sign * (Math.random() * 0.1 - 0.05),
        gamma: Math.random() * 0.01,
        vega: sign * (Math.random() * 20 + 5),
        theta: -Math.random() * 30,
    };
};

/**
 * Simulates executing a straddle strategy and creating a new option position.
 * @param underlying The underlying asset symbol.
 * @param strike The strike price.
 * @param expiry The expiration date.
 * @param quantity The number of contracts.
 * @param strategyType The type of strategy.
 * @returns A promise resolving to a new OptionPosition object.
 */
export const executeStraddle = async (
    underlying: string,
    strike: number,
    expiry: string,
    quantity: number,
    strategyType: 'Long Straddle' | 'Short Straddle'
): Promise<OptionPosition> => {
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const value = (strike * 100 * quantity) * (strategyType === 'Long Straddle' ? 1 : -1) * (0.05 + Math.random() * 0.1);
    
    const newPosition: OptionPosition = {
        id: Date.now(),
        strategy: strategyType,
        underlying,
        strike,
        expiry,
        value,
        pnl: 0,
        pnlPercent: 0,
        greeks: mockCalculateGreeks(strategyType),
    };

    return newPosition;
};