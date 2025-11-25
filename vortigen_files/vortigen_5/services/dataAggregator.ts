import { DataProvider, HistoricalDataPoint } from '../types';

/**
 * Manages multiple data providers for market data, handling failover and aggregation.
 * This ensures data availability even if one source is down.
 * As per the audit, this class functions as an abstraction layer (plugin manager) for
 * different data sources, isolating provider-specific logic from the core application.
 */
class DataAggregator {
    private providers: DataProvider[];
    private currentProviderIndex: number = 0;

    constructor(initialProviders: DataProvider[]) {
        this.providers = this.sortProviders(initialProviders);
        this.currentProviderIndex = 0;
    }

    private sortProviders(providers: DataProvider[]): DataProvider[] {
        return providers.sort((a, b) => a.priority - b.priority);
    }
    
    public updateProviders(newProviders: DataProvider[]) {
        this.providers = this.sortProviders(newProviders);
        this.currentProviderIndex = 0; // Reset to highest priority
    }

    /**
     * Simulates fetching historical data, trying providers in order of priority with exponential backoff.
     * This is the core of the "plugin" architecture for data services; a real implementation
     * would have different logic for each provider type.
     */
    public async fetchHistoricalData(symbol: string, days: number): Promise<HistoricalDataPoint[]> {
        let attempts = 0;
        const enabledProviders = this.providers.filter(p => p.enabled);
        
        if (enabledProviders.length === 0) {
            throw new Error("No enabled data providers available.");
        }

        while (attempts < enabledProviders.length) {
            const provider = enabledProviders[this.currentProviderIndex];
            try {
                console.log(`Fetching historical data for ${symbol} from ${provider.provider} (Attempt ${attempts + 1})`);
                // Simulate API call and random failure
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Make the simulation more robust for demo. Only the first provider has a chance to fail,
                // ensuring the failover mechanism is demonstrated without causing a total failure.
                if (attempts === 0 && Math.random() < 0.3) { // 30% chance for primary provider to fail
                    throw new Error(`Simulated data fetch failure for primary provider: ${provider.provider}`);
                }

                // Generate mock data if successful
                return this.generateMockData(days);

            } catch (error) {
                console.warn(`Data fetch failed for ${provider.provider}.`, error);
                
                // Switch provider
                this.currentProviderIndex = (this.currentProviderIndex + 1) % enabledProviders.length;
                attempts++;

                if (attempts < enabledProviders.length) {
                    // Exponential backoff with jitter
                    const backoffTime = Math.pow(2, attempts) * 100; // 200ms, 400ms, ...
                    const jitter = backoffTime * 0.2 * (Math.random() - 0.5); // +/- 10%
                    const waitTime = backoffTime + jitter;
                    console.log(`Waiting ${waitTime.toFixed(0)}ms before retrying with next provider...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }

        throw new Error("All data providers failed to fetch historical data.");
    }
    
    private generateMockData(days: number): HistoricalDataPoint[] {
        const data: HistoricalDataPoint[] = [];
        let lastPrice = 150 + Math.random() * 50;
        const today = new Date();
        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            lastPrice += (Math.random() - 0.5) * 5;
            data.push({ time: date.toISOString(), value: parseFloat(lastPrice.toFixed(2)) });
        }
        return data;
    }
}

// Singleton instance
let dataAggregatorInstance: DataAggregator | null = null;

export const getDataAggregator = (providers: DataProvider[]): DataAggregator => {
    if (!dataAggregatorInstance) {
        dataAggregatorInstance = new DataAggregator(providers);
    } else {
        dataAggregatorInstance.updateProviders(providers);
    }
    return dataAggregatorInstance;
};