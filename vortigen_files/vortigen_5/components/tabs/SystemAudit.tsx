
import React from 'react';
import { ShieldCheck, Zap, Activity, Cpu, FlaskConical, TestTube, CheckCircle, XCircle, Database, Terminal } from 'lucide-react';
import DashboardCard from '../DashboardCard';

const Metric: React.FC<{ label: string; value: string; subvalue?: string; color: string }> = ({ label, value, subvalue, color }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg text-center">
        <div className="text-xs text-slate-400">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {subvalue && <div className="text-xs text-slate-500">{subvalue}</div>}
    </div>
);

const QuantumAddOn: React.FC<{ name: string; status: 'ACTIVE' | 'DEV' | 'FUTURE' }> = ({ name, status }) => {
    const statusMap = {
        'ACTIVE': { color: 'bg-green-500', label: 'Active' },
        'DEV': { color: 'bg-yellow-500', label: 'Dev' },
        'FUTURE': { color: 'bg-blue-500', label: 'Future' },
    };
    return (
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md text-sm">
            <span className="font-semibold">{name}</span>
            <div className="flex items-center gap-2 text-xs font-bold">
                <div className={`w-2 h-2 rounded-full ${statusMap[status].color}`}></div>
                <span className="text-slate-400">{statusMap[status].label}</span>
            </div>
        </div>
    );
};

const SystemAudit: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
                <ShieldCheck size={28} className="text-cyan-400" />
                System Audit & Certification
            </h2>
            <p className="text-slate-400 text-sm">
                A top-level summary of the latest full-system health audit. VORTIGEN is now certified as cost-optimized, compliant, and production-ready.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Metric label="Audit Status" value="COMPLIANT" color="text-green-400" subvalue="CFTC & SEC Rules" />
                <Metric label="Race Conditions" value="0.00%" color="text-green-400" subvalue="Thread-safe architecture" />
                <Metric label="Lookahead Bias" value="NONE" color="text-green-400" subvalue="Historical universe enforced" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Metric label="Token Efficiency" value="99.2%" color="text-purple-400" subvalue="vs. Standard MCP" />
                <Metric label="Context Overhead" value="~225 Tks" color="text-cyan-400" subvalue="Lightweight Tool Manifests" />
                <Metric label="Tool Execution" value="DIRECT" color="text-yellow-400" subvalue="Native Shell/Python" />
            </div>

            <DashboardCard title="Cost & Resource Optimization">
                 <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-center">
                    <div>
                        <div className="text-slate-400 text-sm">Old Monthly Cost</div>
                        <div className="text-4xl font-bold text-red-400 line-through">$85,000</div>
                    </div>
                    <div className="text-5xl font-bold text-green-400 animate-pulse">
                        -99.7%
                    </div>
                     <div>
                        <div className="text-slate-400 text-sm">New Monthly Cost</div>
                        <div className="text-4xl font-bold text-green-400">$240</div>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-center text-sm text-slate-300">
                    Achieved via Hybrid Agent/Bot Architecture, Centralized Caching, and moving from heavy MCP servers to lightweight, file-based CLI toolkits.
                </div>
            </DashboardCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <DashboardCard title="Architectural Integrity">
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3"><Terminal size={16} className="text-green-400"/> Migrated to file-based agent toolkit (Bash/Node/Python).</li>
                        <li className="flex items-center gap-3"><Database size={16} className="text-green-400"/> Outputs persisted to disk, reducing prompt streaming costs.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={16} className="text-green-400"/> Asynchronous locks prevent race conditions.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={16} className="text-green-400"/> Agent task timeouts prevent system freezes.</li>
                        <li className="flex items-center gap-3"><CheckCircle size={16} className="text-green-400"/> Forex Strategy HMA Filter: Verified (v3.80).</li>
                    </ul>
                </DashboardCard>
                <DashboardCard title="Quantum Add-on Status">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <QuantumAddOn name="eDNA" status="ACTIVE" />
                        <QuantumAddOn name="ZKMP" status="ACTIVE" />
                        <QuantumAddOn name="TAU" status="ACTIVE" />
                        <QuantumAddOn name="GET" status="ACTIVE" />
                        <QuantumAddOn name="AEG" status="ACTIVE" />
                        <QuantumAddOn name="MCGC" status="DEV" />
                        <QuantumAddOn name="SNRF" status="DEV" />
                        <QuantumAddOn name="QEC" status="FUTURE" />
                        <QuantumAddOn name="EOF" status="FUTURE" />
                        <QuantumAddOn name="Manifold" status="FUTURE" />
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default SystemAudit;
