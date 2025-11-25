import React, { memo } from 'react';
import { TrendingUp, TrendingDown, ChevronsRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import DashboardCard from '../DashboardCard';
import { Position, ForumDebate } from '../../types';
import { Decimal } from '../../utils/decimal';

const PositionRow: React.FC<{ pos: Position }> = memo(({ pos }) => {
    const pnl = new Decimal(pos.pnl);
    const pnlPercent = new Decimal(pos.pnlPercent);

    return (
        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
            <div>
                <div className="font-bold">{pos.symbol}</div>
                <div className="text-xs text-slate-500">{new Decimal(pos.qty).toNumber()} qty • {pos.entryTime}</div>
            </div>
            <div className="text-right">
                <div className="font-bold">${new Decimal(pos.current).toFixed(2)}</div>
                <div className={`text-sm font-bold ${pnl.isPositive() ? 'text-green-400' : 'text-red-400'}`}>
                    {pnl.isPositive() ? '+' : ''}${pnl.abs().toFixed(2)} ({pnlPercent.isPositive() ? '+' : ''}{pnlPercent.toFixed(2)}%)
                </div>
            </div>
        </div>
    )
});

const SwarmConsensusCard: React.FC<{ debate: ForumDebate | undefined }> = ({ debate }) => {
    const { dispatch } = useAppContext();

    if (!debate || !debate.summary.actionableSignal) {
        return (
             <DashboardCard title="Swarm Consensus">
                 <div className="h-full flex items-center justify-center text-slate-500">
                     <p>Awaiting high-conviction signal from Agent Forum...</p>
                 </div>
            </DashboardCard>
        );
    }

    const { ticker, direction, confidence, strategy } = debate.summary.actionableSignal;
    const isBullish = direction === 'BULLISH';

    const handleNavigate = () => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'agentForum' });
    }

    return (
        <DashboardCard title="Swarm Consensus">
            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase">Latest Actionable Signal</p>
                    <h3 className="text-4xl font-black mt-1">${ticker}</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-lg font-bold mt-2 ${isBullish ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {isBullish ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        {direction}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                    <div>
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="font-bold text-xl">{confidence}%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400">Consensus Score</div>
                        <div className="font-bold text-xl">{debate.summary.consensusScore || 0}%</div>
                    </div>
                </div>
                 <div>
                    <div className="text-xs text-slate-400">Suggested Strategy</div>
                    <div className="font-semibold text-sm">{strategy}</div>
                </div>
                 <div>
                    <div className="text-xs text-slate-400">Participating Agents</div>
                    <div className="text-sm font-semibold">{debate.participatingAgents.join(', ')}</div>
                </div>
                <button onClick={handleNavigate} className="w-full flex items-center justify-center gap-2 text-sm text-cyan-400 hover:bg-cyan-500/10 py-2 rounded-lg">
                    View Full Debate <ChevronsRight size={16} />
                </button>
            </div>
        </DashboardCard>
    );
};

const Overview: React.FC = () => {
    const { state } = useAppContext();
    const { portfolioValue, dailyPnl, dailyPnlPercent, positions, forumDebates } = state;
    const latestDebate = forumDebates.find(d => d.status === 'complete');
    const pnl = new Decimal(dailyPnl);
    const pnlPercent = new Decimal(dailyPnlPercent);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-8 shadow-lg relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-repeat"
                    style={{
                        backgroundImage: 'linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.2) 50%, transparent 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'background-shine 3s linear infinite'
                    }}
                ></div>
                <div className="relative">
                    <div className="text-cyan-100 text-sm mb-2">TOTAL PORTFOLIO VALUE</div>
                    <div className="text-5xl font-black text-white mb-4">${new Decimal(portfolioValue).toCurrency()}</div>
                    <div className="flex items-center gap-3">
                        <TrendingUp className={pnl.isPositive() ? "text-green-400" : "text-red-400"} size={20} />
                        <span className={`text-white font-bold ${pnl.isPositive() ? 'text-green-300' : 'text-red-300'}`}>
                            {pnl.isPositive() ? '+' : ''}${pnl.toCurrency()} ({pnl.isPositive() ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </span>
                        <span className="text-cyan-100">Today</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DashboardCard title="Your Positions">
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {positions.map((pos, i) => <PositionRow key={i} pos={pos} />)}
                        </div>
                    </DashboardCard>
                </div>
                <div className="space-y-6">
                    <SwarmConsensusCard debate={latestDebate} />
                </div>
            </div>
        </div>
    );
};

export default Overview;