import React, { useState, useEffect, useMemo } from 'react';
import { Wind, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import DashboardCard from '../DashboardCard';
import { fetchVolatilityData, VolatilityData } from '../../services/volatilityService';

const MetricCard: React.FC<{ label: string; value: string; color: string; tooltip: string }> = ({ label, value, color, tooltip }) => (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-center relative group">
        <div className="absolute top-2 right-2 text-slate-600 group-hover:text-slate-400">
            <HelpCircle size={14} />
            <div className="absolute bottom-full mb-2 right-0 w-48 bg-slate-950 text-slate-300 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-slate-700">
                {tooltip}
            </div>
        </div>
        <div className={`text-slate-400 text-sm mb-1`}>{label}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
);

const VolatilityChart: React.FC<{ data: { date: string; hv: number; iv: number }[] }> = ({ data }) => {
    const width = 500;
    const height = 200;
    const padding = { top: 10, right: 10, bottom: 10, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const { allValues, maxVal, minVal } = useMemo(() => {
        const allVals = data.flatMap(d => [d.hv, d.iv]);
        const maxV = Math.max(...allVals) * 1.1;
        const minV = Math.min(...allVals) * 0.9;
        return { allValues: allVals, maxVal: maxV, minVal: minV };
    }, [data]);
    
    const yScale = (value: number) => padding.top + chartHeight - ((value - minVal) / (maxVal - minVal)) * chartHeight;
    const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;

    const yAxisTicks = useMemo(() => {
        const ticks = [];
        const tickCount = 5;
        const step = (maxVal - minVal) / (tickCount - 1);
        for (let i = 0; i < tickCount; i++) {
            ticks.push(minVal + i * step);
        }
        return ticks;
    }, [minVal, maxVal]);

    const hvPath = useMemo(() => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.hv)}`).join(' '), [data, xScale, yScale]);
    const ivPath = useMemo(() => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.iv)}`).join(' '), [data, xScale, yScale]);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Y-Axis Grid and Labels */}
            {yAxisTicks.map(tick => (
                <g key={tick} className="text-slate-600">
                    <line x1={padding.left} y1={yScale(tick)} x2={width-padding.right} y2={yScale(tick)} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x={padding.left - 8} y={yScale(tick)} alignmentBaseline="middle" textAnchor="end" fontSize="10" fill="currentColor">{tick.toFixed(1)}%</text>
                </g>
            ))}
            
            <path d={hvPath} stroke="#a78bfa" fill="none" strokeWidth="2" />
            <path d={ivPath} stroke="#22d3ee" fill="none" strokeWidth="2" />
        </svg>
    );
};

const VolatilitySurface: React.FC<{ surface: number[][] }> = ({ surface }) => {
    const getColor = (value: number) => {
        const normalized = (value - 10) / 30; // Assuming vol range 10-40
        const hue = 200 - normalized * 180; // Blue to Red
        return `hsl(${hue}, 80%, 50%)`;
    };
    return (
        <div className="grid grid-cols-10 gap-1">
            {surface.flat().map((val, i) => (
                <div key={i} className="w-full h-8 rounded" style={{ backgroundColor: getColor(val) }} title={`${val.toFixed(1)}%`} />
            ))}
        </div>
    );
};

const Volatility: React.FC = () => {
    const [volData, setVolData] = useState<VolatilityData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const data = await fetchVolatilityData('SPY');
            setVolData(data);
            setIsLoading(false);
        };
        loadData();
    }, []);

    if (isLoading) {
        return <div className="text-center text-slate-500">Loading volatility data...</div>;
    }

    if (!volData) {
        return <div className="text-center text-red-500">Failed to load volatility data.</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3"><Wind size={28} className="text-cyan-400"/> Volatility Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard label="IV Rank" value={`${volData.ivRank.toFixed(1)}%`} color="text-purple-400" tooltip="Current IV's position relative to its 1-year high and low."/>
                <MetricCard label="IV Percentile" value={`${volData.ivPercentile.toFixed(1)}%`} color="text-cyan-400" tooltip="Percentage of days in the past year that IV was lower than the current IV."/>
                <MetricCard label="Skewness Index" value={volData.skew.toFixed(2)} color={volData.skew > 0 ? "text-green-400" : "text-red-400"} tooltip="Measures the asymmetry of option implied volatility. Negative skew (put premium) is common."/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="HV vs. IV (30-Day)">
                    <div className="flex justify-end gap-4 text-xs mb-2">
                        <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#a78bfa] rounded-sm"></div>Historical Vol</span>
                        <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#22d3ee] rounded-sm"></div>Implied Vol</span>
                    </div>
                    <div className="h-64">
                        <VolatilityChart data={volData.history} />
                    </div>
                </DashboardCard>
                <DashboardCard title="Volatility Surface (Smile/Smirk)">
                     <div className="space-y-2">
                         <p className="text-sm text-slate-400 mb-2">Heatmap of implied volatility across different strike prices and expiries.</p>
                         <VolatilitySurface surface={volData.surface} />
                         <div className="flex justify-between text-xs text-slate-500">
                             <span>Deep ITM</span>
                             <span>OTM</span>
                         </div>
                     </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default Volatility;