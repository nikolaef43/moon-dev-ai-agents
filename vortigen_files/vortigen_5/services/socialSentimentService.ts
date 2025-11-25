import { SocialSentimentData, TrendingTicker, KeyNarrative } from '../types';

/**
 * Simulates fetching and analyzing data from various social media sources.
 * In a real application, this would involve complex scraping, NLP, and
 * trend detection algorithms.
 * @returns A promise resolving to mock SocialSentimentData.
 */
export const fetchSocialSentimentData = async (): Promise<SocialSentimentData> => {
    // Simulate network delay and complex analysis
    await new Promise(resolve => setTimeout(resolve, 700));

    const mockTrendingTickers: TrendingTicker[] = [
        { symbol: 'NVDA', platform: 'X', mentions: 12543, sentiment: 'bullish' },
        { symbol: 'TSLA', platform: 'Reddit', mentions: 8976, sentiment: 'bearish' },
        { symbol: 'GME', platform: 'Reddit', mentions: 5432, sentiment: 'bullish' },
        { symbol: 'BTC', platform: 'X', mentions: 21876, sentiment: 'neutral' },
    ];

    const mockKeyNarratives: KeyNarrative[] = [
        {
            title: "AI Chip Demand Surge",
            summary: "Discussion volume around NVIDIA's new Blackwell GPU architecture is extremely high, with analysts raising price targets citing unprecedented demand.",
            source: "X & Analyst Reports"
        },
        {
            title: "EV Market Headwinds",
            summary: "Sentiment on Tesla and other EV makers is turning negative due to reports of slowing sales growth and increased competition from legacy automakers.",
            source: "Reddit (r/wallstreetbets)"
        },
        {
            title: "Fed Rate Cut Speculation",
            summary: "The market is pricing in a 75% chance of a rate cut in the next FOMC meeting, leading to broad bullish sentiment in equities but caution in bonds.",
            source: "Financial News Aggregators"
        }
    ];

    return {
        overallSentiment: 68, // A score out of 100
        trendingTickers: mockTrendingTickers,
        keyNarratives: mockKeyNarratives,
        bioPsyche: {
            cortisolEstimate: 72, // 0-100, higher is more stressed
            sleepDebt: 65, // 0-100, higher is more sleep deprived
        }
    };
};