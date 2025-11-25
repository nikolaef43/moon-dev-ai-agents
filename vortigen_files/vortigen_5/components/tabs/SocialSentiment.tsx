import React, { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, ChevronsRight, Loader, WifiOff, HeartPulse, Bed } from 'lucide-react';
import { SocialSentimentData, TrendingTicker, KeyNarrative } from '../../types';
import { fetchSocialSentimentData } from '../../services/socialSentimentService';
import DashboardCard from '../DashboardCard';

const SentimentGauge: React.FC<{ value: number }> = ({ value }) => {
    const rotation = (value / 100) * 180 - 90;
    const color = value > 60 ? '#22c55e' : value > 40 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative w-48 h-24 overflow-hidden mx-auto">
            <div className="absolute w-full h-full border-[20px] border-slate-700 rounded-t-full border-b-0"></div>
            <div
                className="absolute w-full h-full border-[20px] rounded-t-full border-b-0 transition-all duration-500"
                style={{
                    clipPath: `inset(0 ${100 - value}% 0 0)`,
                    borderColor: color
                }}
            ></div>
            <div
                className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom transition-transform duration-500"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            ></div>
            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl font-bold">{value}</div>
        </div>
    );
};

const TickerCard: React.FC<{ ticker: TrendingTicker }> = ({ ticker }) => {
    const sentimentMap = {
        bullish: { icon: <TrendingUp size={16} className="text-green-400" />, color: 'border-green-500/50' },
        bearish: { icon: <TrendingDown size={16} className="text-red-400" />, color: 'border-red-500/50' },
        neutral: { icon: <ChevronsRight size={16} className="text-yellow-400" />, color: 'border-yellow-500/50' },
    };
    return (
        <div className={`bg-slate-800/50 p-3 rounded-lg border-l-4 ${sentimentMap[ticker.sentiment].color} flex justify-between items-center`}>
            <div>
                <div className="font-bold text-lg">${ticker.symbol}</div>
                <div className="text-xs text-slate-400">Source: {ticker.platform}</div>
            </div>
            <div className="text-right">
                <div className="flex items-center justify-end gap-2 font-semibold">
                    {sentimentMap[ticker.sentiment].icon} {ticker.sentiment}
                </div>
                <div className="text-xs text-slate-500">{ticker.mentions.toLocaleString()} mentions</div>
            </div>
        </div>
    );
};


const SocialSentiment: React.FC = () => {
    const [data, setData] = useState<SocialSentimentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const result = await fetchSocialSentimentData();
                setData(result);
            } catch (err) {
                setError("Failed to fetch social sentiment data.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-slate-500"><Loader size={32} className="animate-spin mr-4"/>Loading social sentiment feed...</div>;
    }

    if (error) {
        return <div className="flex flex-col items-center justify-center h-full text-red-400"><WifiOff size={48} className="mb-4"/><p>{error}</p></div>;
    }

    if (!data) {
        return <div className="text-center text-slate-500">No social sentiment data available.</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
                <MessageSquare size={28} className="text-cyan-400"/> Social Sentiment Analysis
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardCard title="Overall Market Sentiment" className="lg:col-span-1">
                    <SentimentGauge value={data.overallSentiment} />
                     <div className="text-center text-slate-400 mt-4 text-sm">
                        Based on analysis of 1M+ posts in the last 24 hours.
                    </div>
                </DashboardCard>

                <DashboardCard title="Trending Tickers" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.trendingTickers.map(ticker => (
                            <TickerCard key={`${ticker.symbol}-${ticker.platform}`} ticker={ticker} />
                        ))}
                    </div>
                </DashboardCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <DashboardCard title="Key Market Narratives" className="lg:col-span-3">
                    <div className="space-y-4">
                        {data.keyNarratives.map(narrative => (
                             <div key={narrative.title} className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                                 <h3 className="font-bold text-lg text-cyan-400 mb-1">{narrative.title}</h3>
                                 <p className="text-sm text-slate-300 mb-2">{narrative.summary}</p>
                                 <p className="text-xs text-slate-500">Primary Source: {narrative.source}</p>
                             </div>
                        ))}
                    </div>
                </DashboardCard>
                 <DashboardCard title="Bio-Psyche Feed" className="lg:col-span-2">
                    <p className="text-sm text-slate-400 mb-4">Pure sentiment indicators derived from aggregate, anonymized biological data.</p>
                    <div className="space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2"><HeartPulse size={16} className="text-red-400"/> Population Cortisol Estimate</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-full bg-slate-700 rounded-full h-4">
                                    <div className="bg-red-500 h-4 rounded-full" style={{width: `${data.bioPsyche?.cortisolEstimate || 0}%`}}></div>
                                </div>
                                <span className="font-bold text-lg text-red-400">{data.bioPsyche?.cortisolEstimate}%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Market Stress Level: High</p>
                        </div>
                         <div className="bg-slate-800/50 p-4 rounded-lg">
                            <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-2"><Bed size={16} className="text-blue-400"/> Collective Sleep Debt</h4>
                             <div className="flex items-center gap-3">
                                <div className="w-full bg-slate-700 rounded-full h-4">
                                    <div className="bg-blue-500 h-4 rounded-full" style={{width: `${data.bioPsyche?.sleepDebt || 0}%`}}></div>
                                </div>
                                <span className="font-bold text-lg text-blue-400">{data.bioPsyche?.sleepDebt}%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Potential for Irrationality: Elevated</p>
                        </div>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default SocialSentiment;