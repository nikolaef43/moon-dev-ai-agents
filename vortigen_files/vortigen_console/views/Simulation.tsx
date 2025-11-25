import React, { useState } from 'react';
import { Strategy, StrategyType, SimulationResult, SimulationScenario } from '../types';
import { FlaskIcon } from '../components/icons';

const scenarios: SimulationScenario[] = [
    'Market Crash',
    'High Volatility',
    'Liquidity Squeeze',
    'Geopolitical Shock',
];

const ResultCard: React.FC<{ result: SimulationResult | null }> = ({ result }) => {
    if (!result) {
        return (
            <div className="bg-gray-800/50 p-6 rounded-lg border border-dashed border-gray-700 flex items-center justify-center h-full min-h-[250px]">
                <p className="text-gray-500">Awaiting simulation results...</p>
            </div>
        );
    }
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-fade-in h-full flex flex-col justify-between min-h-[250px]">
            <div>
                <h3 className="text-md font-semibold text-blue-400 mb-4">
                    Result: {result.strategy} <br/> <span className="text-sm text-gray-400">Scenario: {result.scenario}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-4">
                    <div>
                        <p className="text-xs text-gray-400">Causal Alpha</p>
                        <p className={`text-2xl font-bold ${result.causalAlpha > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {result.causalAlpha > 0 ? '+' : ''}{result.causalAlpha.toFixed(4)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Resilience</p>
                        <p className="text-2xl font-bold text-white">{result.resilienceScore.toFixed(2)}/10</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Futures</p>
                        <p className="text-2xl font-bold text-white">{(result.probableFutures / 1_000_000).toFixed(2)}M</p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-md mt-auto">
                <h4 className="font-semibold text-gray-300 text-sm">Key Learning & Adaptation:</h4>
                <p className="text-xs text-gray-400 mt-1">{result.collectiveAdaptation}</p>
            </div>
        </div>
    );
};


interface PanelState {
    selectedStrategy: StrategyType;
    selectedScenario: SimulationScenario;
    result: SimulationResult | null;
}

interface SimulationPanelProps {
    strategies: Strategy[];
    panelId: string;
    panelState: PanelState;
    onStateChange: (newState: PanelState) => void;
    isSimulating: boolean;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ strategies, panelId, panelState, onStateChange, isSimulating }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4">Configuration {panelId}</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400 block mb-1">Strategy</label>
                    <select
                        value={panelState.selectedStrategy}
                        onChange={(e) => onStateChange({ ...panelState, selectedStrategy: e.target.value as StrategyType })}
                        className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isSimulating}
                    >
                        {strategies.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm text-gray-400 block mb-1">Adversarial Scenario</label>
                    <select
                        value={panelState.selectedScenario}
                        onChange={(e) => onStateChange({ ...panelState, selectedScenario: e.target.value as SimulationScenario })}
                        className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isSimulating}
                    >
                        {scenarios.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};


export const Simulation: React.FC<{ strategies: Strategy[], onSimulationComplete: (result: SimulationResult) => void }> = ({ strategies, onSimulationComplete }) => {
    const [panelA, setPanelA] = useState<PanelState>({
        selectedStrategy: strategies[0].name,
        selectedScenario: scenarios[0],
        result: null
    });
    const [panelB, setPanelB] = useState<PanelState>({
        selectedStrategy: strategies[1] ? strategies[1].name : strategies[0].name,
        selectedScenario: scenarios[0],
        result: null
    });

    const [isSimulating, setIsSimulating] = useState(false);

    const runSimulationForPanel = (panelState: PanelState): SimulationResult => {
        return {
            strategy: panelState.selectedStrategy,
            scenario: panelState.selectedScenario,
            causalAlpha: (Math.random() - 0.3) * 0.05,
            resilienceScore: Math.random() * 3 + 6.5,
            probableFutures: Math.floor(Math.random() * 500000) + 1000000,
            // fix: Corrected property access from `panelState.scenario` to `panelState.selectedScenario`.
            keyLearning: `Identified a previously un-modeled correlation under ${panelState.selectedScenario} conditions.`,
            collectiveAdaptation: `Integrating new correlation factor into risk models for all ${panelState.selectedStrategy} agents.`
        };
    }

    const handleSimulate = () => {
        setIsSimulating(true);
        setPanelA(prev => ({ ...prev, result: null }));
        setPanelB(prev => ({ ...prev, result: null }));

        setTimeout(() => {
            const resultA = runSimulationForPanel(panelA);
            const resultB = runSimulationForPanel(panelB);
            
            setPanelA(prev => ({ ...prev, result: resultA }));
            onSimulationComplete(resultA);
            
            setPanelB(prev => ({ ...prev, result: resultB }));
            onSimulationComplete(resultB);
            
            setIsSimulating(false);
        }, 3000);
    };

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
            <div className="flex items-center gap-3">
                <FlaskIcon className="w-8 h-8 text-green-400" />
                <h1 className="text-2xl font-bold text-white">Causal Inference & Simulation Sandbox</h1>
            </div>
            
             <div className="text-sm text-gray-400">
                Configure two distinct simulations to run a comparative pre-mortem analysis. This allows for side-by-side evaluation of different strategies under identical conditions, or a single strategy under different adversarial scenarios.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimulationPanel strategies={strategies} panelId="A" panelState={panelA} onStateChange={setPanelA} isSimulating={isSimulating} />
                <SimulationPanel strategies={strategies} panelId="B" panelState={panelB} onStateChange={setPanelB} isSimulating={isSimulating} />
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="w-full max-w-md bg-green-600 text-white font-bold py-3 px-6 rounded-md transition-colors hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isSimulating ? 'Simulating...' : 'Run Comparative Analysis'}
                </button>
            </div>

            {isSimulating && (
                <div className="text-center p-6">
                    <p className="text-lg text-gray-300 animate-pulse">Running quantum simulations... Analyzing causal pathways...</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
                 <ResultCard result={panelA.result} />
                 <ResultCard result={panelB.result} />
            </div>
        </div>
    );
};