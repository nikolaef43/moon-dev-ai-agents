

import React from 'react';
import { AuditLog, LogLevel } from '../types';
import { ListIcon } from '../components/icons';

const levelColorMap: Record<LogLevel, string> = {
    INFO: 'text-gray-400',
    WARN: 'text-yellow-400',
    CRITICAL: 'text-red-500',
    CONSENSUS: 'text-blue-400',
    EVOLUTION: 'text-purple-400',
    BOARD: 'text-cyan-400',
};

const levelBorderMap: Record<LogLevel, string> = {
    INFO: 'border-gray-600',
    WARN: 'border-yellow-600',
    CRITICAL: 'border-red-600',
    CONSENSUS: 'border-blue-600',
    EVOLUTION: 'border-purple-600',
    BOARD: 'border-cyan-600',
};

const LogRow: React.FC<{ log: AuditLog }> = ({ log }) => (
    <div className={`p-3 flex items-start gap-3 border-l-4 ${levelBorderMap[log.level]} bg-gray-900/30`}>
        <div className="font-mono text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</div>
        <div className="flex-1">
            <p className={`font-semibold text-sm ${levelColorMap[log.level]}`}>{log.level}</p>
            <p className="text-sm text-gray-300">{log.message}</p>
            {log.agentId && <p className="text-xs text-gray-500 font-mono mt-1">Source: {log.agentId}</p>}
        </div>
    </div>
);

export const AuditLogView: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
    return (
        <div className="h-full flex flex-col p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
                <ListIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Live Audit Log</h1>
            </div>
            <div className="flex-grow overflow-y-auto bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="space-y-2 p-2">
                     {logs.map(log => <LogRow key={log.id} log={log} />)}
                </div>
            </div>
        </div>
    );
};