export interface VolatilityData {
    ivRank: number;
    ivPercentile: number;
    skew: number;
    history: { date: string; hv: number; iv: number }[];
    surface: number[][];
}

/**
 * Simulates fetching complex volatility data for a given symbol.
 * @param symbol The stock ticker to generate data for.
 * @returns A promise resolving to a mock VolatilityData object.
 */
export const fetchVolatilityData = async (symbol: string): Promise<VolatilityData> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate calculation delay

    const history = [...Array(30)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        const baseHv = 15 + Math.sin(i / 5) * 5;
        const baseIv = baseHv + (Math.random() - 0.3) * 5;
        return {
            date: date.toISOString(),
            hv: parseFloat(baseHv.toFixed(2)),
            iv: parseFloat(baseIv.toFixed(2))
        };
    });

    const surface = [...Array(5)].map((_, rowIndex) => 
        [...Array(10)].map((_, colIndex) => {
            // Create a "smirk" effect, common in equity options
            const baseVol = 20;
            const smileEffect = Math.pow(colIndex - 4.5, 2) * 0.1;
            const skewEffect = (colIndex - 4.5) * -0.5;
            const termStructure = rowIndex * 1.5;
            return parseFloat((baseVol + smileEffect + skewEffect + termStructure).toFixed(2));
        })
    );


    return {
        ivRank: Math.random() * 100,
        ivPercentile: Math.random() * 100,
        skew: -0.2 + (Math.random() - 0.5) * 0.3,
        history,
        surface,
    };
};
