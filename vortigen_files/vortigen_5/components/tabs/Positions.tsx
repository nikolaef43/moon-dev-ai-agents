import React, { useMemo } from 'react';
import { Target, XCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Decimal } from '../../utils/decimal';

const Positions: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { positions, positionFilter } = state;

    const filteredPositions = useMemo(() => {
        if (!positionFilter.query) {
            return positions;
        }
        return positions.filter(p => 
            p.symbol.toLowerCase().includes(positionFilter.query.toLowerCase())
        );
    }, [positions, positionFilter]);

    const clearFilter = () => {
        dispatch({ type: 'SET_POSITION_FILTER', payload: { query: '' } });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3"><Target size={28} className="text-cyan-400"/> Your Positions</h2>
                {positionFilter.query && (
                    <button onClick={clearFilter} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                        <XCircle size={14}/>
                        Clear Filter: "{positionFilter.query}"
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {filteredPositions.length > 0 ? filteredPositions.map((pos, i) => {
                    const currentPrice = new Decimal(pos.current);
                    const pnl = new Decimal(pos.pnl);
                    const pnlPercent = new Decimal(pos.pnlPercent);
                    const qty = new Decimal(pos.qty);
                    const entryPrice = new Decimal(pos.entryPrice);
                    const marketValue = qty.multiply(currentPrice);

                    return (
                        <div key={i} className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold">{pos.symbol}</h3>
                                    <p className="text-slate-400">{pos.entryTime}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">${currentPrice.toCurrency(2)}</div>
                                    <div className={`text-lg font-bold ${pnl.isPositive() ? 'text-green-400' : 'text-red-400'}`}>
                                        {pnl.isPositive() ? '+' : ''}${pnl.abs().toCurrency(2)} ({pnl.isPositive() ? '+' : ''}{pnlPercent.toFixed(2)}%)
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded mb-4">
                                <div><div className="text-xs text-slate-400">Qty</div><div className="font-bold">{qty.toNumber()}</div></div>
                                <div><div className="text-xs text-slate-400">Entry Price</div><div className="font-bold">${entryPrice.toCurrency(2)}</div></div>
                                <div><div className="text-xs text-slate-400">Market Value</div><div className="font-bold">${marketValue.toCurrency(0)}</div></div>
                                <div><div className="text-xs text-slate-400">P&L</div><div className={`font-bold ${pnl.isPositive() ? 'text-green-400' : 'text-red-400'}`}>{pnl.isPositive() ? '+' : ''}${pnl.toCurrency(2)}</div></div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No positions match the filter "{positionFilter.query}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Positions;