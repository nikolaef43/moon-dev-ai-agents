import React, { useState, useEffect, useMemo } from 'react';
import { BrainCircuit, Activity, AlertTriangle, PlayCircle, Loader2, GitBranch } from 'lucide-react';
import DashboardCard from '../DashboardCard';
import { fetchStrategyDecayData, fetchAdaptationLogs, fetchAgentAccuracyDrift, runParameterDriftAnalysis } from '../../services/selfLearningService';
import { StrategyDecayData, AdaptationLog, AgentDriftData, ParameterDriftLog } from '../../types';
import { useAppContext } from '../../context/AppContext';

const TinyChart: React.FC<{ data: { time: string; value: number }[]; isDecaying?: boolean }> = ({ data, isDecaying }) => {
    const width = 200;
    const height = 50;
    const values = data.map(d => d.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);

    const path = useMemo(() => {
        if (data.length < 2) return '';
        const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
        const xScale = (index: number) => (index / (data.length - 1)) * width;
        const yScale = (value: number) => height - ((value - minVal) / valRange) * height;
        return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');
    }, [data, maxVal, minVal]);

    const strokeColor = isDecaying ? '#f87171' : '#4ade80'; // red-400 or green-400

    return <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16"><path d={path} stroke={strokeColor} fill="none" strokeWidth="2" /></svg>;
};

const CodeGenomeViz: React.FC = () => (
    <div className="h-48 w-full bg-slate-900/50 p-3 rounded-lg border border-slate-800 flex items-center justify-center">
        <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{stopColor: 'rgb(74, 222, 128)', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: 'rgb(74, 222, 128)', stopOpacity: 0}} />
                </radialGradient>
            </defs>
            <path d="M 10 50 C 40 10, 60 10, 90 50 S 140 90, 190 50" stroke="#475569" strokeWidth="1" fill="none" />
            <circle cx="10" cy="50" r="4" fill="#22d3ee" />
            <circle cx="50" cy="28" r="5" fill="#a78bfa" className="animate-pulse" />
            <circle cx="90" cy="50" r="6" fill="#22d3ee"><animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" /></circle>
            <circle cx="140" cy="62" r="3" fill="#a78bfa" />
            <circle cx="190" cy="50" r="4" fill="#22d3ee" />
            <g transform="translate(90, 50)">
                 <path d="M 0 0 C 10 -20, 30 -20, 40 0" stroke="#f472b6" strokeWidth="0.5" fill="none" strokeDasharray="2,2" />
                 <circle cx="20" cy="-15" r="3" fill="#f472b6" />
                 <text x="23" y="-20" fill="#f472b6" fontSize="5">hot-swap v2.1</text>
            </g>
             <rect x="84" y="44" width="12" height="12" fill="url(#grad1)" />
        </svg>
    </div>
);

const SystemEvolution: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { aiAgents, isAnalyzingDrift, parameterDriftLogs } = state;
    const [decayData, setDecayData] = useState<StrategyDecayData[]>([]);
    const [adaptLogs, setAdaptLogs] = useState<AdaptationLog[]>([]);
    const [driftData, setDriftData] = useState<AgentDriftData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [decay, logs, drift] = await Promise.all([
                fetchStrategyDecayData(),
                fetchAdaptationLogs(),
                fetchAgentAccuracyDrift()
            ]);
            setDecayData(decay);
            setAdaptLogs(logs);
            setDriftData(drift);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const handleRunOptimization = async () => {
        dispatch({ type: 'RUN_PARAMETER_DRIFT_ANALYSIS_START' });
        const result = await runParameterDriftAnalysis(aiAgents);
        if (result) {
            dispatch({ type: 'RUN_PARAMETER_DRIFT_ANALYSIS_COMPLETE', payload: result });
        } else {
            // Handle case where no agent was found to optimize
            dispatch({ type: 'RUN_PARAMETER_DRIFT_ANALYSIS_COMPLETE', payload: { agentId: '', newParameters: {}, logs: [] } });
            dispatch({ type: 'SHOW_NOTIFICATION', payload: { type: 'info', message: 'No agents with tunable parameters found.' } });
        }
    };

    if (isLoading) {
        return <div className="text-center text-slate-500">Initializing Self-Learning Agent...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3"><BrainCircuit size={28} className="text-cyan-400" /> System Evolution</h2>
            <p className="text-slate-400 text-sm">
                This dashboard provides a transparent view into the `SelfLearningAgent`'s autonomous processes, including performance monitoring, model adaptation, and strategy evolution.
            </p>
            
            <DashboardCard title="Metamorphic Code Genesis Core (MCGC)">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="md:w-1/2">
                         <CodeGenomeViz />
                    </div>
                     <div className="md:w-1/2">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><GitBranch size={18}/> Code Genome</h3>
                        <p className="text-sm text-slate-400">
                            The AI's source code is treated as a mutable strategy. The MCGC continuously analyzes its own performance, rewriting and hot-swapping its underlying algorithms to evolve into a more perfect entity. This visualization represents the live, evolving code-base.
                        </p>
                    </div>
                </div>
            </DashboardCard>

            <DashboardCard title="Parameter Drift & Adaptation (SelfLearningAgent)">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <h3 className="font-bold text-lg mb-2">Weekly Optimization</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Trigger the Self-Learning agent to analyze live performance vs. backtests and adapt strategy parameters for the current market regime.
                        </p>
                        <button
                            onClick={handleRunOptimization}
                            disabled={isAnalyzingDrift}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                            {isAnalyzingDrift ? (
                                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                            ) : (
                                <><PlayCircle size={16} /> Run Weekly Optimization Cycle</>
                            )}
                        </button>
                    </div>
                    <div className="md:w-2/3">
                        <h3 className="font-bold text-lg mb-2">Adaptation Log</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            {isAnalyzingDrift && parameterDriftLogs.length === 0 && (
                                <div className="text-center text-slate-500 py-4">Analyzing performance data...</div>
                            )}
                            {parameterDriftLogs.length > 0 ? parameterDriftLogs.map(log => (
                                <div key={log.id} className="text-xs font-mono text-slate-400">
                                    <p><span className="text-cyan-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span> AdaptBot: {log.reason}</p>
                                </div>
                            )) : !isAnalyzingDrift && <div className="text-center text-slate-500 py-4">No optimization cycles run yet.</div>}
                        </div>
                    </div>
                </div>
            </DashboardCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="Strategy Performance Decay (DecayBot)">
                    <div className="space-y-4">
                        <div className="text-xs text-slate-400 grid grid-cols-4 font-bold">
                            <div className="col-span-1">Strategy</div>
                            <div className="col-span-2 text-center">30-Day Sharpe Trend</div>
                            <div className="col-span-1 text-right">Current Sharpe</div>
                        </div>
                        {decayData.map(strat => (
                            <div key={strat.strategyName} className={`grid grid-cols-4 items-center p-2 rounded-lg ${strat.isDecaying ? 'bg-red-900/20' : ''}`}>
                                <div className="col-span-1 font-semibold flex items-center gap-2">
                                     {strat.isDecaying && <AlertTriangle size={14} className="text-red-400" />}
                                     {strat.strategyName}
                                </div>
                                <div className="col-span-2">
                                    <TinyChart data={strat.performance.map(p => ({ time: p.time, value: p.sharpe }))} isDecaying={strat.isDecaying} />
                                </div>
                                <div className="col-span-1 text-right font-mono font-bold text-lg">
                                    {strat.performance[strat.performance.length - 1].sharpe.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardCard>

                <DashboardCard title="Model Accuracy Drift">
                     <div className="space-y-4">
                        <div className="text-xs text-slate-400 grid grid-cols-4 font-bold">
                            <div className="col-span-1">Agent</div>
                            <div className="col-span-2 text-center">30-Day Accuracy Trend</div>
                            <div className="col-span-1 text-right">Current Acc.</div>
                        </div>
                        {driftData.map(agent => (
                            <div key={agent.agentName} className="grid grid-cols-4 items-center">
                                <div className="col-span-1 font-semibold">{agent.agentName}</div>
                                <div className="col-span-2">
                                    <TinyChart data={agent.accuracyTrend.map(p => ({ time: p.time, value: p.accuracy }))} />
                                </div>
                                <div className="col-span-1 text-right font-mono font-bold text-lg">
                                    {agent.accuracyTrend[agent.accuracyTrend.length - 1].accuracy.toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default SystemEvolution;