
import React, { memo } from 'react';
import { Command, Menu, X, Bell, ChevronsRight, FileText, Shield } from 'lucide-react';
import { SystemStatus } from '../types';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
    showSidebar: boolean;
    toggleSidebar: () => void;
    onGenerateReport: () => void;
    systemStatus: SystemStatus;
    isProcessing: boolean;
    toggleStatus: () => void;
    killSwitch: () => void;
    handleManualCycle: () => void;
}

const Header: React.FC<HeaderProps> = memo(({ 
    showSidebar, 
    toggleSidebar, 
    onGenerateReport,
    systemStatus,
    isProcessing,
    toggleStatus,
    killSwitch,
    handleManualCycle
}) => {
    const { dispatch } = useAppContext();
    
    return (
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 no-print">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded" aria-label="Toggle sidebar">
                    {showSidebar ? <X size={20} /> : <Menu size={20} />}
                </button>
                <button 
                    onClick={() => dispatch({ type: 'TOGGLE_COMMAND_PALETTE' })}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800"
                >
                    <Command size={16} />
                    Cognitive Command
                    <span className="text-xs bg-slate-700 text-slate-300 rounded px-1.5 py-0.5">⌘K</span>
                </button>
            </div>
            <div className="flex items-center gap-4">
                <div className="p-2 rounded group relative" title="Quantum Entanglement Channel: Nominal">
                    <Shield size={18} className="text-cyan-400 animate-pulse-glow" />
                </div>
                <button 
                    onClick={handleManualCycle}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded font-semibold text-sm transition-colors flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                    <ChevronsRight size={16} />
                    {isProcessing ? 'Processing...' : 'Manual Cycle'}
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                        systemStatus === "active" ? "bg-green-400" :
                        systemStatus === "paused" ? "bg-yellow-400" :
                        "bg-red-400"
                    } ${systemStatus === "emergency_stop" ? "animate-ping" : ""}`}></div>
                    <span className={`${systemStatus === "emergency_stop" ? "text-red-500" : ""}`}>{systemStatus.toUpperCase().replace('_', ' ')}</span>
                </div>
                <button
                    onClick={toggleStatus}
                    disabled={systemStatus === 'stopped' || systemStatus === 'emergency_stop'}
                    className={`px-4 py-2 rounded font-semibold text-sm transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed ${
                    systemStatus === "active" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                    {systemStatus === "active" ? "Pause" : "Resume"}
                </button>
                <button onClick={killSwitch} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold text-sm">
                    KILL SWITCH
                </button>
                 <button onClick={onGenerateReport} className="p-2 hover:bg-slate-800 rounded" aria-label="Generate Report">
                    <FileText size={18} />
                </button>
                <button className="p-2 hover:bg-slate-800 rounded relative" aria-label="Notifications">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
        </header>
    );
});

export default Header;
