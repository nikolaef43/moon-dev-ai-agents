import React from 'react';
import { DataSource, DataSourceStatus } from '../types';
import { DataDiscoveryIcon } from '../components/icons';

const statusConfig: Record<DataSourceStatus, { color: string; label: string }> = {
    Discovered: { color: 'bg-gray-500', label: 'Discovered' },
    Evaluating: { color: 'bg-yellow-500', label: 'Evaluating' },
    Integrating: { color: 'bg-blue-500', label: 'Integrating' },
    Active: { color: 'bg-green-500', label: 'Active' },
    Rejected: { color: 'bg-red-500', label: 'Rejected' },
};

const DataSourceRow: React.FC<{ source: DataSource }> = ({ source }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50">
        <td className="px-4 py-3 text-sm text-gray-200 font-mono">{source.id}</td>
        <td className="px-4 py-3 text-sm text-gray-300">{source.type}</td>
        <td className="px-4 py-3 text-sm text-gray-400">{source.sourceName}</td>
        <td className="px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${statusConfig[source.status].color}`}></span>
                <span className="text-gray-300">{statusConfig[source.status].label}</span>
            </div>
        </td>
        <td className="px-4 py-3 text-sm text-center font-mono">{source.integrityScore.toFixed(2)}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{new Date(source.lastUpdated).toLocaleString()}</td>
    </tr>
);

export const DataDiscovery: React.FC<{ dataSources: DataSource[] }> = ({ dataSources }) => {
    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6">
            <div className="flex items-center gap-3">
                <DataDiscoveryIcon className="w-8 h-8 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white">Autonomous Data Market Discovery</h1>
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Live Scavenger Feed</h2>
                <div className="font-mono text-xs text-cyan-300 bg-black/30 p-4 rounded-md h-32 overflow-y-auto space-y-2">
                   <p>> [INFO] Agent SMC_3 scanning decentralized knowledge graphs for alpha signals...</p>
                   <p>> [INFO] Agent MR_2 evaluating integrity of a new satellite imagery feed (source: Star-Omega-7)...</p>
                   <p>> [WARN] Agent OFI_5 rejected a novel sentiment API due to high latency (250ms+)...</p>
                   <p>> [INFO] Agent GS_1 initiating integration of a verified quantum entropy source...</p>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto bg-gray-800/50 rounded-lg border border-gray-700">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-gray-900 z-10">
                        <tr className="border-b border-gray-600">
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Source ID</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Integrity</th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Update</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {dataSources.map(source => <DataSourceRow key={source.id} source={source} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};