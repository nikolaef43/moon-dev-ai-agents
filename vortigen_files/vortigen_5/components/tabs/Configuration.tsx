
import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, ListChecks, Terminal, FileCode, FolderOpen, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import DashboardCard from '../DashboardCard';
import { APIProvider, DataProvider, APIProviderName, DataProviderName } from '../../types';
import CodeViewerModal from '../CodeViewerModal';
import { POLYMARKET_AGENT_PY, FETCH_MARKET_DATA_PY } from '../../utils/pythonTemplates';
import { XAUUSD_SWING_STRATEGY_CODE } from '../../utils/mql5Templates';

const Configuration: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [localThreshold, setLocalThreshold] = useState(state.agentHealthThreshold);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [viewCode, setViewCode] = useState<{ name: string, code: string, lang: string } | null>(null);
    
    // Use local state for API keys to avoid re-renders on every keystroke
    const [localApiProviders, setLocalApiProviders] = useState(state.apiProviders);
    const [localDataProviders, setLocalDataProviders] = useState(state.dataProviders);
    
    useEffect(() => {
        setLocalThreshold(state.agentHealthThreshold);
        setLocalApiProviders(state.apiProviders);
        setLocalDataProviders(state.dataProviders);
    }, [state.agentHealthThreshold, state.apiProviders, state.dataProviders]);

    const handleSave = () => {
        if (window.confirm('Are you sure you want to save these settings?')) {
            // Dispatch all changes at once
            dispatch({ type: 'SET_AGENT_HEALTH_THRESHOLD', payload: Number(localThreshold) });
            localApiProviders.forEach(p => {
                dispatch({ type: 'UPDATE_API_PROVIDER', payload: { provider: p.provider, apiKey: p.apiKey, enabled: p.enabled }});
            });
            localDataProviders.forEach(p => {
                dispatch({ type: 'UPDATE_DATA_PROVIDER', payload: { provider: p.provider, apiKey: p.apiKey, enabled: p.enabled }});
            });
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };
    
    const handleApiProviderChange = (provider: APIProviderName, key: string, enabled: boolean) => {
        setLocalApiProviders(prev => prev.map(p => p.provider === provider ? {...p, apiKey: key, enabled} : p));
    };

    const handleDataProviderChange = (provider: DataProviderName, key: string, enabled: boolean) => {
        setLocalDataProviders(prev => prev.map(p => p.provider === provider ? {...p, apiKey: key, enabled} : p));
    };
    
    const tools = [
        { perm: '-rwxr-x', name: 'polymarket_agent.py', lang: 'Python', size: '12KB', code: POLYMARKET_AGENT_PY },
        { perm: '-rwxr-x', name: 'fetch_market_data.py', lang: 'Python', size: '2.4KB', code: FETCH_MARKET_DATA_PY },
        { perm: '-rwxr-x', name: 'run_backtest.sh', lang: 'Bash', size: '1.1KB', code: '# ... bash script ...' },
        { perm: '-rwxr-x', name: 'sentiment_scraper.js', lang: 'Node.js', size: '4.8KB', code: '// ... node scraper ...' },
        { perm: '-rwxr-x', name: 'execute_twap.py', lang: 'Python', size: '3.2KB', code: '# ... twap logic ...' },
        { perm: '-rwxr-x', name: 'analyze_volatility.R', lang: 'R', size: '1.9KB', code: '# ... R analysis ...' },
        { perm: '-rwxr-x', name: 'XAUUSD_Swing_EMA_RSI.mq5', lang: 'MQL5', size: '14KB', code: XAUUSD_SWING_STRATEGY_CODE },
        { perm: '-rwxr-x', name: 'Hull_Moving_Average.ex5', lang: 'MQL5', size: '4KB', code: '// Binary EX5 file placeholder' },
        { perm: '-rwxr-x', name: 'ALMA.ex5', lang: 'MQL5', size: '5KB', code: '// Binary EX5 file placeholder' },
        { perm: '-rwxr-x', name: 'risk_check_params.json', lang: 'JSON', size: '0.5KB', code: JSON.stringify({ max_drawdown: 0.05, leverage: 10 }, null, 2) },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3"><Settings size={28} className="text-cyan-400"/> Configuration & Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DashboardCard title="Emergent Objective Function (EOF)">
                    <p className="text-sm text-slate-400 mb-4">The AI's self-determined goals, derived from its core directive. This is a read-only view into its autonomous reasoning.</p>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Core Directive</label>
                            <p className="text-sm p-3 bg-slate-800/50 rounded-lg mt-1">Ensure long-term capital preservation and growth while minimizing market destabilization.</p>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Emergent Objectives</label>
                            <ul className="text-sm p-3 bg-slate-800/50 rounded-lg mt-1 space-y-2 list-disc list-inside">
                                <li>Achieve 15% return with &lt; 0.01% impact on overall market volatility.</li>
                                <li>Maintain a portfolio Sharpe Ratio above 2.0.</li>
                                <li>Identify and hedge against unpriced systemic risks with a 6-month horizon.</li>
                            </ul>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Monitoring Settings">
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="health-threshold" className="text-sm text-slate-400 block mb-2">Agent Health Alert Threshold (%)</label>
                            <input
                                id="health-threshold"
                                type="number"
                                value={localThreshold}
                                onChange={(e) => setLocalThreshold(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                                min="0"
                                max="100"
                            />
                            <p className="text-xs text-slate-500 mt-1">Agents with health below this value will be flagged.</p>
                        </div>
                    </div>
                </DashboardCard>
                
                <DashboardCard title="Lightweight Tool Registry (Disk-Based)" className="md:col-span-2">
                    <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                        <FolderOpen size={16} className="text-yellow-400"/>
                        <span className="font-mono text-slate-500">/opt/vortigen/tools/</span>
                        <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">Status: MOUNTED</span>
                    </div>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs space-y-2">
                        <div className="flex items-center gap-3 text-slate-300 border-b border-slate-800 pb-2 mb-2 font-bold">
                            <div className="w-8 text-center">Perm</div>
                            <div className="flex-1">Filename</div>
                            <div className="w-20 text-center">Lang</div>
                            <div className="w-24 text-right">Size</div>
                            <div className="w-10 text-center">Act</div>
                        </div>
                        {tools.map((tool, i) => (
                             <div key={i} className="flex items-center gap-3 text-slate-400 hover:bg-slate-800/50 rounded px-2 py-1 transition-colors cursor-default group">
                                <div className="w-8 text-slate-600">{tool.perm}</div>
                                <div className="flex-1 flex items-center gap-2">
                                    <FileCode size={14} className="text-cyan-500 group-hover:text-cyan-400"/>
                                    <span className="group-hover:text-slate-200">{tool.name}</span>
                                </div>
                                <div className="w-20 text-center text-slate-500">{tool.lang}</div>
                                <div className="w-24 text-right text-slate-600">{tool.size}</div>
                                <div className="w-10 text-center">
                                    <button 
                                        onClick={() => setViewCode({ name: tool.name, code: tool.code, lang: tool.lang.toLowerCase() })}
                                        className="p-1 hover:text-white text-slate-500 transition-colors" 
                                        title="View Source"
                                    >
                                        <Eye size={14}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                        <Terminal size={12}/> Agents invoke these tools directly via PATH, bypassing heavy MCP protocols to save ~90% tokens.
                    </p>
                </DashboardCard>

                <DashboardCard title="API & Integrations" className="md:col-span-2">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-base font-bold text-slate-300 mb-3">AI API Providers</h4>
                            <div className="space-y-3">
                                {localApiProviders.map(p => (
                                    <div key={p.provider} className="grid grid-cols-12 items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                                        <div className="col-span-3 flex items-center gap-2">
                                            <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer" onClick={() => handleApiProviderChange(p.provider, p.apiKey, !p.enabled)}>
                                                <input type="checkbox" checked={p.enabled} readOnly className="absolute w-full h-full opacity-0"/>
                                                <div className={`block h-4 rounded-full ${p.enabled ? 'bg-green-500/50' : 'bg-slate-600'}`}></div>
                                                <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${p.enabled ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="font-semibold text-sm capitalize">{p.provider}</span>
                                            {p.enabled && !p.apiKey && <AlertTriangle size={14} className="text-yellow-400" title="API Key is missing!"/>}
                                        </div>
                                        <input 
                                            type="password"
                                            value={p.apiKey}
                                            onChange={(e) => handleApiProviderChange(p.provider, e.target.value, p.enabled)}
                                            placeholder={`${p.provider.charAt(0).toUpperCase() + p.provider.slice(1)} API Key`}
                                            className="col-span-9 w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-base font-bold text-slate-300 mb-3 pt-4 border-t border-slate-800">Market Data Providers</h4>
                            <div className="space-y-3">
                                {localDataProviders.map(p => (
                                     <div key={p.provider} className="grid grid-cols-12 items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                                        <div className="col-span-3 flex items-center gap-2">
                                            <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer" onClick={() => handleDataProviderChange(p.provider, p.apiKey, !p.enabled)}>
                                                <input type="checkbox" checked={p.enabled} readOnly className="absolute w-full h-full opacity-0"/>
                                                <div className={`block h-4 rounded-full ${p.enabled ? 'bg-green-500/50' : 'bg-slate-600'}`}></div>
                                                <div className={`dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${p.enabled ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="font-semibold text-sm capitalize">{p.provider.replace('_', ' ')}</span>
                                            {p.enabled && !p.apiKey && <AlertTriangle size={14} className="text-yellow-400" title="API Key is missing!"/>}
                                        </div>
                                        <input 
                                            type="password"
                                            value={p.apiKey}
                                            onChange={(e) => handleDataProviderChange(p.provider, e.target.value, p.enabled)}
                                            placeholder={`${p.provider.replace('_', ' ').split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')} API Key`}
                                            className="col-span-9 w-full bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none" 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DashboardCard>
            </div>
            
            <div className="mt-6 flex items-center gap-4">
                <button onClick={handleSave} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">Save All Settings</button>
                {saveSuccess && (
                    <div className="text-green-400 text-sm font-semibold transition-opacity duration-300">
                        ✅ Settings saved successfully!
                    </div>
                )}
            </div>
            
            {viewCode && (
                <CodeViewerModal 
                    code={viewCode.code} 
                    title={viewCode.name} 
                    onClose={() => setViewCode(null)} 
                    language={viewCode.lang === 'mql5' ? 'cpp' : viewCode.lang} // PrismJS mapping approximation
                />
            )}
        </div>
    );
};

export default Configuration;
