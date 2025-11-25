import React from 'react';
import { View, SystemState } from '../types';
import { VortigenOSLogo, DashboardIcon, AgentsIcon, CollectiveIcon, StrategiesIcon, ShieldCheckIcon, ListIcon, EvolutionIcon, FlaskIcon, DataDiscoveryIcon, ConsensusIcon, AIBoardIcon, QuantumIcon, RouterIcon, PredictionsIcon, GavelIcon } from './icons';

const NavItem: React.FC<{ view: View; label: string; icon: React.FC<{className?:string}>; currentView: View; setView: (view: View) => void; }> = 
({ view, label, icon: Icon, currentView, setView }) => (
    <button onClick={() => setView(view)} className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${
        currentView === view ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
    }`}>
        <Icon className="w-5 h-5 mr-3" />
        <span>{label}</span>
    </button>
);

export const Sidebar: React.FC<{ currentView: View; setView: (view: View) => void; systemState: SystemState; }> = ({ currentView, setView, systemState }) => {
    const { circuitBreaker } = systemState;
    const dailyLossPct = (circuitBreaker.dailyLoss / circuitBreaker.dailyLossLimit) * 100;
    const drawdownPct = (circuitBreaker.maxDrawdown / circuitBreaker.maxDrawdownLimit) * 100;

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm border-r border-gray-700 w-64 flex-shrink-0 p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <VortigenOSLogo className="w-8 h-8 text-blue-400" />
                <h1 className="text-xl font-bold text-gray-200">VortigenOS</h1>
            </div>
            <nav className="flex-1 space-y-1.5 overflow-y-auto">
                <NavItem view="dashboard" label="Dashboard" icon={DashboardIcon} currentView={currentView} setView={setView} />
                <NavItem view="board" label="AI Board of Directors" icon={AIBoardIcon} currentView={currentView} setView={setView} />
                <NavItem view="boardroom" label="Boardroom" icon={GavelIcon} currentView={currentView} setView={setView} />
                <NavItem view="router" label="Model Router" icon={RouterIcon} currentView={currentView} setView={setView} />
                <NavItem view="predictions" label="Predictions" icon={PredictionsIcon} currentView={currentView} setView={setView} />
                <NavItem view="collective" label="Collective Intelligence" icon={CollectiveIcon} currentView={currentView} setView={setView} />
                <NavItem view="agents" label="Agents & Bots" icon={AgentsIcon} currentView={currentView} setView={setView} />
                <NavItem view="consensus" label="Trade Consensus" icon={ConsensusIcon} currentView={currentView} setView={setView} />
                <NavItem view="evolution" label="System Evolution" icon={EvolutionIcon} currentView={currentView} setView={setView} />
                <NavItem view="simulation" label="Causal Simulation" icon={FlaskIcon} currentView={currentView} setView={setView} />
                <NavItem view="quantum" label="Quantum Core" icon={QuantumIcon} currentView={currentView} setView={setView} />
                <NavItem view="data" label="Data Discovery" icon={DataDiscoveryIcon} currentView={currentView} setView={setView} />
                <NavItem view="strategies" label="Strategies" icon={StrategiesIcon} currentView={currentView} setView={setView} />
                <NavItem view="risk" label="Risk Management" icon={ShieldCheckIcon} currentView={currentView} setView={setView} />
                <NavItem view="logs" label="Audit Log" icon={ListIcon} currentView={currentView} setView={setView} />
            </nav>
            <div className="mt-auto flex-shrink-0">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pt-2">Risk Status</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Daily Loss</span>
                            <span>{dailyLossPct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${dailyLossPct}%` }}></div>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Max Drawdown</span>
                            <span>{drawdownPct.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${drawdownPct}%` }}></div>
                        </div>
                    </div>
                </div>
                 <p className="text-xs text-center text-gray-500 mt-4">CFTC RULE 4.41 APPLIES.</p>
            </div>
        </div>
    );
};