

import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, CheckCircle, XCircle, TestTube, Play } from 'lucide-react';
import DashboardCard from '../DashboardCard';
import { useAppContext } from '../../context/AppContext';
import { calculateVaR, runStressTests, calculateAgentRisk, VaRResult, StressTestResult, AgentRiskResult } from '../../services/riskAnalysisService';
import { PreTradeCheckLog } from '../../types';

const RiskHub: React.FC = () => {
    const { state } = useAppContext();
    const { portfolioValue, aiAgents, riskParameters, preTradeCheckLog } = state;
    const [varResults, setVarResults] = useState<VaRResult[]>([]);
    const [stressTestResults, setStressTestResults] = useState<StressTestResult[]>([]);
    const [agentRisk, setAgentRisk] = useState<AgentRiskResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const portfolioValueRef = useRef(portfolioValue);
    const aiAgentsRef = useRef(aiAgents);

    useEffect(() => {
        portfolioValueRef.current = portfolioValue;
        aiAgentsRef.current = aiAgents;
    }, [portfolioValue, aiAgents]);

    useEffect(() => {
      const load = async () => {
        setIsLoading(true);
        const [varRes, stressRes, agentRes] = await Promise.all([
          calculateVaR(portfolioValueRef.current).catch(() => []),
          runStressTests(portfolioValueRef.current).catch(() => []),
          calculateAgentRisk(aiAgentsRef.current).catch(() => []),
        ]);
        setVarResults(varRes as VaRResult[]);
        setStressTestResults(stressRes as StressTestResult[]);
        setAgentRisk(agentRes as AgentRiskResult[]);
        setIsLoading(false);
      };
      load();
    }, []);

    const PreTradeCheckLogRow: React.FC<{ log: PreTradeCheckLog }> = ({ log }) => (
        <div className="flex items-start gap-3 p-2 bg-slate-800/50 rounded-md text-xs">
            {log.status === 'PASS' 
                ? <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                : <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            }
            <div className="flex-grow">
                <p className="text-slate-300">
                    <span className="font-bold">{log.signal.ticker} {log.signal.direction}</span> signal check: <span className={`font-bold ${log.status === 'PASS' ? 'text-green-400' : 'text-red-400'}`}>{log.status}</span>
                </p>
                <p className="text-slate-500">{log.reason}</p>
            </div>
            <div className="text-slate-500 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</div>
        </div>
    );

    if (isLoading) {
        return <div className="text-center text-slate-500">Running initial risk simulations...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3"><ShieldAlert size={28} className="text-cyan-400"/> Risk Hub</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <DashboardCard title="Pre-Trade Risk Controls">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Max Position Size (USD)</span> <span className="font-bold font-mono">${riskParameters.maxPositionSizeUSD.toLocaleString()}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Max Portfolio Allocation %</span> <span className="font-bold font-mono">{riskParameters.maxPortfolioAllocation}%</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Max Leverage</span> <span className="font-bold font-mono">{riskParameters.maxLeverage}x</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-400">Min Order Size (USD)</span> <span className="font-bold font-mono">${riskParameters.minOrderSize.toLocaleString()}</span></div>
                        <div className="flex justify-between text-sm pt-3 border-t border-slate-800"><span className="text-slate-400">Consensus Threshold</span> <span className="font-bold font-mono">{riskParameters.consensusThreshold}%</span></div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Pre-Trade Check Log (RiskOfficer)">
                    <div className="space-y-2 h-40 overflow-y-auto">
                        {preTradeCheckLog.length > 0 ? preTradeCheckLog.map(log => <PreTradeCheckLogRow key={log.id} log={log}/>)
                        : <div className="h-full flex items-center justify-center text-slate-500 text-sm">Awaiting trade signals...</div>}
                    </div>
                </DashboardCard>

                <DashboardCard title="Value at Risk (VaR) - 1 Day">
                    <div className="space-y-4">
                         <div className="text-xs text-slate-400 grid grid-cols-2 font-bold">
                            <div className="col-span-1">Confidence Level</div>
                            <div className="col-span-1">Potential Loss</div>
                        </div>
                        {varResults.map(result => (
                            <div key={result.confidence} className="grid grid-cols-2 items-center">
                                <div className="text-sm font-semibold">{result.confidence}%</div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-bold text-red-400">${result.loss.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(result.loss / (portfolioValue * 0.1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardCard>

                <DashboardCard title="Portfolio Stress Testing">
                    <div className="space-y-3">
                         <div className="text-xs text-slate-400 grid grid-cols-3 font-bold">
                            <div className="col-span-1">Scenario</div>
                            <div className="col-span-1 text-right">P&L Impact</div>
                             <div className="col-span-1 text-right">% Impact</div>
                        </div>
                        {stressTestResults.map(result => (
                             <div key={result.scenario} className="grid grid-cols-3 text-sm items-center">
                                <div className="font-semibold text-slate-300">{result.scenario}</div>
                                <div className="text-right font-mono text-red-400">${result.pnlImpact.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                                <div className="text-right font-mono text-red-400">{result.pnlImpactPercent.toFixed(1)}%</div>
                             </div>
                        ))}
                    </div>
                </DashboardCard>

                <DashboardCard title="Narrative Stress Testing (SNRF)">
                     <div className="space-y-3">
                        <p className="text-sm text-slate-400">Simulate synthetic information attacks to test agent resilience.</p>
                        <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-sm">
                            <Play size={16}/> Initiate Narrative Simulation
                        </button>
                        <div className="text-xs space-y-2 pt-2 border-t border-slate-800">
                            <div className="font-semibold text-slate-300">Last Simulation Log:</div>
                             <p className="text-slate-400">
                                <span className="font-bold text-green-400">[PASS]</span> Synthetic FUD campaign on $TSLA. SocialSentimentAgent resilience: 98.7%.
                            </p>
                        </div>
                    </div>
                </DashboardCard>

                <div className="lg:col-span-1 xl:col-span-1">
                    <DashboardCard title="Risk Contribution by Agent">
                         <div className="space-y-3 h-40 overflow-y-auto">
                            {agentRisk.slice(0, 5).map(agent => (
                                <div key={agent.name} className="grid grid-cols-5 items-center gap-4">
                                    <div className="col-span-2 text-sm font-semibold">{agent.name}</div>
                                    <div className="col-span-3">
                                        <div className="w-full bg-slate-800 rounded-full h-5 flex items-center">
                                            <div className="bg-gradient-to-r from-yellow-500 to-red-500 h-5 rounded-full flex items-center justify-end px-2 text-xs font-bold" style={{ width: `${agent.riskContribution}%` }}>
                                                 {agent.riskContribution.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};

export default RiskHub;