
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const USStocks = () => {
    const [symbol, setSymbol] = useState('AAPL');
    const [marketData, setMarketData] = useState(null);
    const [account, setAccount] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [symbol]);

    const fetchData = async () => {
        try {
            const [accRes, dataRes] = await Promise.all([
                api.getUSStockAccount(),
                api.getUSStockData(symbol)
            ]);
            setAccount(accRes.data);

            // Transform data for chart
            const chartData = Object.entries(dataRes.data.data).map(([date, values]) => ({
                date: new Date(date).toLocaleTimeString(),
                price: values.close
            })).slice(-20); // Last 20 points

            setMarketData(chartData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleTrade = async (action) => {
        if (!amount) return;
        setLoading(true);
        try {
            await api.executeUSStockTrade({
                symbol,
                action,
                amount_usd: parseFloat(amount)
            });
            alert(`${action.toUpperCase()} order submitted!`);
            fetchData();
        } catch (error) {
            alert('Trade failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>US Stocks</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Trade equities with zero commission (Mock Mode)</p>
                </div>
                <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', gap: '20px' }}>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Buying Power</span>
                        <div style={{ fontWeight: 600 }}>${account?.buying_power || '0.00'}</div>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Equity</span>
                        <div style={{ fontWeight: 600 }}>${account?.equity || '0.00'}</div>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Chart Section */}
                <div className="glass-panel card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    style={{
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--glass-border)',
                                        padding: '8px 8px 8px 35px',
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <h2 style={{ margin: 0 }}>{symbol}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['1H', '4H', '1D', '1W'].map(tf => (
                                <button key={tf} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>{tf}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: '400px', width: '100%' }}>
                        {marketData ? (
                            <ResponsiveContainer>
                                <LineChart data={marketData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                    <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--glass-border)' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                Loading market data...
                            </div>
                        )}
                    </div>
                </div>
                                placeholder="0.00"
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '12px 12px 12px 35px',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        <button
                            className="btn-primary"
                            style={{ background: 'var(--success)' }}
                            onClick={() => handleTrade('buy')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'BUY'}
                        </button>
                        <button
                            className="btn-primary"
                            style={{ background: 'var(--danger)' }}
                            onClick={() => handleTrade('sell')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'SELL'}
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Order Book (Mock)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {[152.50, 152.45, 152.40].map(p => (
                                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', fontSize: '0.9rem' }}>
                                    <span>{p.toFixed(2)}</span>
                                    <span>{(Math.random() * 100).toFixed(0)}</span>
                                </div>
                            ))}
                            <div style={{ borderBottom: '1px solid var(--glass-border)', margin: '5px 0' }}></div>
                            {[152.30, 152.25, 152.20].map(p => (
                                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontSize: '0.9rem' }}>
                                    <span>{p.toFixed(2)}</span>
                                    <span>{(Math.random() * 100).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default USStocks;
