import React from 'react';
import { Flame, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import DashboardCard from '../DashboardCard';
import { useAppContext } from '../../context/AppContext';
import { executeStraddle } from '../../services/optionsService';
import { Activity } from '../../types';
import { Decimal } from '../../utils/decimal';

const MetricCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-center">
        <div className={`text-slate-400 text-sm mb-1`}>{label}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
);

const OptionPositionTable: React.FC = () => {
    const { state } = useAppContext();
    const { optionsPositions } = state;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" className="px-4 py-3">Strategy</th>
                        <th scope="col" className="px-4 py-3">Underlying</th>
                        <th scope="col" className="px-4 py-3 text-right">Δ (Delta)</th>
                        <th scope="col" className="px-4 py-3 text-right">Γ (Gamma)</th>
                        <th scope="col" className="px-4 py-3 text-right">ν (Vega)</th>
                        <th scope="col" className="px-4 py-3 text-right">θ (Theta)</th>
                        <th scope="col" className="px-4 py-3 text-right">P&L</th>
                    </tr>
                </thead>
                <tbody>
                    {optionsPositions.map((pos) => {
                        const pnl = new Decimal(pos.pnl);
                        const pnlPercent = new Decimal(pos.pnlPercent);
                        return (
                            <tr key={pos.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-medium">{pos.strategy}</td>
                                <td className="px-4 py-3">{pos.underlying} @ ${pos.strike}</td>
                                <td className="px-4 py-3 text-right font-mono">{pos.greeks.delta.toFixed(3)}</td>
                                <td className="px-4 py-3 text-right font-mono">{pos.greeks.gamma.toFixed(3)}</td>
                                <td className="px-4 py-3 text-right font-mono">{pos.greeks.vega.toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-mono">{pos.greeks.theta.toFixed(2)}</td>
                                <td className={`px-4 py-3 text-right font-bold ${pnl.isPositive() ? 'text-green-400' : 'text-red-400'}`}>
                                    {pnl.isPositive() ? '+' : ''}${pnl.abs().toCurrency(0)} ({pnlPercent.toFixed(1)}%)
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const Options: React.FC = () => {
    const { dispatch } = useAppContext();
    const vixZScore = -1.88;
    const isLowVol = vixZScore < 0;

    const handleExecuteStrategy = async () => {
        const strategyType = isLowVol ? 'Long Straddle' : 'Short Straddle';
        const newPosition = await executeStraddle('SPX', 4550, '2024-09-30', 1, strategyType);
        dispatch({ type: 'ADD_OPTION_POSITION', payload: newPosition });
        
        const newActivity: Activity = {
            id: Date.now(),
            type: 'EXECUTION',
            agent: 'OptionsAgent',
            message: `Executed ${strategyType} on SPX @ 4550 for 1 contract.`,
            timestamp: new Date().toISOString()
        };
        dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3"><Flame size={28} className="text-cyan-400"/> Options & Volatility Trading</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard label="VIX Index" value="12.45" color="text-slate-100" />
                <MetricCard label="VIX 21-Day Z-Score" value={vixZScore.toFixed(2)} color={isLowVol ? 'text-green-400' : 'text-red-400'} />
                <DashboardCard title="Market Regime & Strategy" className="!p-4 text-center">
                    <div className="text-slate-400 text-sm mb-1">Current Volatility Regime</div>
                    <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-2 ${isLowVol ? 'text-green-400' : 'text-red-400'}`}>
                        {isLowVol ? <TrendingDown size={28} /> : <TrendingUp size={28} />}
                        {isLowVol ? 'Low Volatility' : 'High Volatility'}
                    </div>
                     <div className="text-xs text-slate-500">Recommended Strategy: <span className="font-bold text-cyan-400">{isLowVol ? 'Long Straddle (Buy Vol)' : 'Short Straddle (Sell Vol)'}</span></div>
                </DashboardCard>
            </div>
            
            <DashboardCard title="Active Volatility Positions">
                <div className="flex justify-end mb-4">
                     <button onClick={handleExecuteStrategy} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold">
                        <PlusCircle size={16} />
                        Execute Recommended Strategy
                    </button>
                </div>
                <OptionPositionTable />
            </DashboardCard>
        </div>
    );
};

export default Options;