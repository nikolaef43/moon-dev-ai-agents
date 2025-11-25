import { AppState, HistoricalDataPoint, Position, DataProvider } from "../types";
import { getDataAggregator } from './dataAggregator';

/**
 * Simulates fetching live market data. In a real app, this would use the DataAggregator
 * to connect to a real-time WebSocket or polling service.
 */
const mockFetchMarketData = async (positions: Position[]): Promise<{ [key: string]: number }> => {
    const priceMap: { [key: string]: number } = {};
    positions.forEach(p => {
        const volatility = p.symbol.includes('BTC') || p.symbol.includes('ETH') ? 0.005 : 0.015;
        const changePercent = (Math.random() - 0.5) * volatility;
        const newPrice = p.current * (1 + changePercent);
        priceMap[p.symbol] = newPrice;
    });
    await new Promise(resolve => setTimeout(resolve, 250));
    return priceMap;
};

// --- EXPORTED SERVICE FUNCTIONS ---

/**
 * Main service function to get market data. Now uses the mock generator.
 */
export const fetchMarketData = async (positions: AppState['positions']): Promise<{ [key: string]: number }> => {
    // In a real implementation, this would also use the DataAggregator for real-time price feeds.
    return mockFetchMarketData(positions);
};

/**
 * Main service function to get historical data. Now uses the DataAggregator.
 */
export const fetchPolygonHistoricalData = async (
    symbol: string,
    days: number = 90,
    providers: DataProvider[]
): Promise<HistoricalDataPoint[]> => {
    const aggregator = getDataAggregator(providers);
    return aggregator.fetchHistoricalData(symbol, days);
};