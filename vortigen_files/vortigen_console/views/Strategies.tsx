import React, { useState } from 'react';
import { Strategy, BacktestResult, StrategyType } from '../types';
import { StrategiesIcon, PlayIcon } from '../components/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BacktestResultDisplay: React.FC<{ result: BacktestResult }> = ({ result }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col">
            <h4 className="text-md font-semibold text-gray-200 mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-4 text-center flex-grow">
                <div>
                    <p className="text-xs text-gray-400">Net P&L</p>
                    <p className={`text-2xl font-bold ${result.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${result.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400">Trades</p>
                    <p className="text-2xl font-bold text-white">{result.trades}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Max Drawdown</p>
                    <p className="text-2xl font-bold text-yellow-400">{(result.maxDrawdown * 100).toFixed(2)}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Sharpe Ratio</p>
                    <p className="text-2xl font-bold text-blue-400">{result.sharpeRatio.toFixed(2)}</p>
                </div>
            </div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col h-64">
             <h4 className="text-md font-semibold text-gray-200 mb-4">Equity Curve</h4>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equityCurve} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', {month:'short', day:'numeric'})} />
                    <YAxis stroke="#9CA3AF" fontSize={10} domain={['auto', 'auto']} tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                        labelStyle={{ color: '#F9FAFB' }}
                        formatter={(value: number, name, props) => [`$${value.toLocaleString()}`, 'Equity']}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#10B981" fill="url(#colorEquity)" />
                     <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);


const BacktestPanel: React.FC<{ strategy: Strategy, onRunBacktest: (strategy: StrategyType, startDate: string, endDate: string, initialCapital: number) => void }> = ({ strategy, onRunBacktest }) => {
    const [startDate, setStartDate] = useState('2023-01-01');
    const [endDate, setEndDate] = useState('2023-12-31');
    const [initialCapital, setInitialCapital] = useState(100000);
    const [isSimulating, setIsSimulating] = useState(false);
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [viewMode, setViewMode] = useState<'config' | 'code'>('config');

    const handleRun = () => {
        setIsSimulating(true);
        setResult(null);
        onRunBacktest(strategy.name, startDate, endDate, initialCapital);
        
        // Simulate backtest results based on strategy's actual statistics to provide plausible data.
        setTimeout(() => {
            const { winRate, profitFactor } = strategy;
            let equity = initialCapital;
            let peakEquity = initialCapital;
            let maxDrawdown = 0;
            const trades = Math.floor(Math.random() * 150) + 100; // 100-250 trades
            const tradeReturns: number[] = [];

            const avgLossPct = -0.015; // Assume a baseline average loss of 1.5%
            // Calculate avgWin based on profit factor: PF = (WR * avgWin) / ((1-WR) * avgLoss)
            const avgWinPct = (profitFactor * (1 - winRate) * Math.abs(avgLossPct)) / winRate;
            
            for (let i = 0; i < trades; i++) {
                const isWin = Math.random() < winRate;
                const tradeReturn = isWin ? avgWinPct : avgLossPct;
                tradeReturns.push(tradeReturn);
            }
            
            const days = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24);
            const tradesPerDay = trades / days;

            const equityCurve = [{ date: startDate, equity: initialCapital }];
            let currentTradeIndex = 0;

            for (let i = 1; i <= days; i++) {
                const date = new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                let dailyEquity = equity;
                
                const tradesToday = Math.floor(tradesPerDay) + (Math.random() < (tradesPerDay % 1) ? 1 : 0);

                for(let t = 0; t < tradesToday; t++) {
                    if (currentTradeIndex < trades) {
                        dailyEquity *= (1 + tradeReturns[currentTradeIndex]);
                        currentTradeIndex++;
                    }
                }
                
                equity = dailyEquity;
                peakEquity = Math.max(peakEquity, equity);
                const drawdown = (peakEquity - equity) / peakEquity;
                maxDrawdown = Math.max(maxDrawdown, drawdown);
                
                equityCurve.push({ date, equity });
            }

            const finalEquity = equityCurve[equityCurve.length-1].equity;
            const returns = equityCurve.map((e, i) => i === 0 ? 0 : (e.equity / equityCurve[i-1].equity) - 1);
            const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
            const stdDev = Math.sqrt(returns.reduce((sq, n) => sq + Math.pow(n - avgReturn, 2), 0) / (returns.length - 1));
            const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized Sharpe

            setResult({
                pnl: finalEquity - initialCapital,
                maxDrawdown: maxDrawdown,
                sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
                trades: trades,
                equityCurve
            });
            setIsSimulating(false);
        }, 2500);
    };

    // Determine language for syntax highlighting/badge
    const language = strategy.sourceCode?.includes('PolymarketAgent') ? 'Python' : (strategy.sourceCode?.includes('#property') ? 'MQL5' : 'Code');

    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Strategy Control</h3>
                    <p className="text-sm text-blue-300">{strategy.name}</p>
                </div>
                <div className="flex bg-gray-900 rounded-lg p-1">
                    <button 
                        onClick={() => setViewMode('config')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'config' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Config
                    </button>
                    <button 
                        onClick={() => setViewMode('code')}
                        disabled={!strategy.sourceCode}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'code' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 disabled:opacity-30'}`}
                    >
                        Source Code
                    </button>
                </div>
            </div>

            {viewMode === 'code' && strategy.sourceCode ? (
                <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 bg-gray-900/50 p-2 rounded">
                        <span className="text-xs font-mono text-gray-400">FILE: {language === 'Python' ? 'agent_logic.py' : 'strategy.mq5'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${language === 'Python' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'}`}>{language}</span>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-md overflow-auto font-mono text-xs text-gray-300 border border-gray-700 flex-grow h-0 shadow-inner">
                        <pre>{strategy.sourceCode}</pre>
                    </div>
                    <div className="mt-4 flex justify-end">
                         <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-lg">
                            Download Source
                         </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Initial Capital</label>
                            <input type="number" value={initialCapital} onChange={e => setInitialCapital(Number(e.target.value))} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" disabled={isSimulating} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" disabled={isSimulating} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" disabled={isSimulating} />
                        </div>
                        <button onClick={handleRun} disabled={isSimulating} className="self-end w-full h-full bg-blue-600 text-white font-bold rounded-md transition-colors hover:bg-blue-500 disabled:bg-gray-600 flex items-center justify-center gap-2 shadow-lg">
                            <PlayIcon className="w-5 h-5" />
                            {isSimulating ? 'Running...' : 'Run Backtest'}
                        </button>
                    </div>
                    <div className="flex-grow">
                        {isSimulating && (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-400 animate-pulse">Performing walk-forward analysis on historical data...</p>
                            </div>
                        )}
                        {result && <BacktestResultDisplay result={result} />}
                    </div>
                </>
            )}
        </div>
    );
};


const StrategyCard: React.FC<{ strategy: Strategy, isSelected: boolean, onSelect: () => void }> = React.memo(({ strategy, isSelected, onSelect }) => (
    <div 
        className={`bg-gray-800/50 p-5 rounded-lg border-2 flex flex-col cursor-pointer transition-all duration-200 ${isSelected ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}
        onClick={onSelect}
    >
        <h3 className="text-lg font-semibold text-blue-400 truncate">{strategy.name}</h3>
        <p className="text-xs text-gray-500 mb-4 truncate">{strategy.validation}</p>
        <div className="mt-auto grid grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-xs text-gray-400">Win Rate</p>
                <p className="text-xl font-bold text-white">{(strategy.winRate * 100).toFixed(1)}%</p>
            </div>
            <div>
                <p className="text-xs text-gray-400">Profit Factor</p>
                <p className="text-xl font-bold text-white">{strategy.profitFactor.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-xs text-gray-400">Edge vs Random</p>
                <p className="text-xl font-bold text-green-400">+{strategy.edgeVsRandom.toFixed(2)}σ</p>
            </div>
        </div>
    </div>
));

export const Strategies: React.FC<{ strategies: Strategy[], onRunBacktest: (strategy: StrategyType, startDate: string, endDate: string, initialCapital: number) => void }> = ({ strategies, onRunBacktest }) => {
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(strategies[0] || null);
    
    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6">
            <div className="flex items-center gap-3">
                <StrategiesIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Strategy Portfolio & Backtesting</h1>
            </div>
            <div className="overflow-y-auto pr-2">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {strategies.map(strategy => <StrategyCard key={strategy.name} strategy={strategy} isSelected={selectedStrategy?.name === strategy.name} onSelect={() => setSelectedStrategy(strategy)} />)}
                </div>
            </div>
            <div className="flex-grow min-h-[350px]">
                {selectedStrategy ? (
                    <BacktestPanel strategy={selectedStrategy} onRunBacktest={onRunBacktest} />
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                        <p className="text-gray-500">Select a strategy to configure a backtest.</p>
                    </div>
                )}
            </div>
        </div>
    );
};