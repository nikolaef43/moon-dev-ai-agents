import React from 'react';
import { SystemState } from '../types';
import { ShieldCheckIcon } from '../components/icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type GaugeProps = {
    value: number;
    limit: number;
    title: string;
    color: string;
};

const Gauge: React.FC<GaugeProps> = ({ value, limit, title, color }) => {
    const percentage = Math.min(100, (value / limit) * 100);
    const data = [
        { name: 'Used', value: percentage },
        { name: 'Remaining', value: 100 - percentage }
    ];
    const COLORS = [color, '#4B5563'];

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p className="text-3xl font-bold text-white -mt-16">{(value * 100).toFixed(2)}%</p>
            <p className="text-sm text-gray-400">Limit: {(limit * 100).toFixed(1)}%</p>
        </div>
    );
};

export const Risk: React.FC<{ circuitBreaker: SystemState['circuitBreaker'] }> = ({ circuitBreaker }) => {
    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Risk Management Overview</h1>
            </div>
            <div className="flex justify-center items-center">
                <div className="w-full max-w-4xl p-4 bg-gray-900/50 rounded-lg">
                    <div className="text-center mb-6">
                        <p className="text-sm uppercase text-gray-400">System Status</p>
                        <p className={`text-3xl font-bold ${circuitBreaker.status === 'SAFE' ? 'text-green-400' : 'text-red-500'}`}>{circuitBreaker.status}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Gauge value={circuitBreaker.dailyLoss} limit={circuitBreaker.dailyLossLimit} title="Daily Loss Limit" color="#FBBF24" />
                        <Gauge value={circuitBreaker.maxDrawdown} limit={circuitBreaker.maxDrawdownLimit} title="Max Drawdown Limit" color="#EF4444" />
                    </div>
                </div>
            </div>
        </div>
    );
};