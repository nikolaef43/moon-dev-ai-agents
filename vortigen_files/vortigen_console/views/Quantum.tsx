import React from 'react';
import { QuantumAddon, QuantumAddonStatus } from '../types';
import { QuantumIcon } from '../components/icons';

const statusConfig: Record<QuantumAddonStatus, { color: string; label: string }> = {
    ACTIVE: { color: 'bg-green-500', label: 'Active' },
    DEV: { color: 'bg-yellow-500', label: 'In Development' },
    FUTURE: { color: 'bg-blue-500', label: 'Future Roadmap' },
};

const AddonCard: React.FC<{ addon: QuantumAddon }> = ({ addon }) => (
    <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-blue-400">{addon.name}</h3>
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusConfig[addon.status].color}`}></span>
                    <span className="text-xs font-semibold text-gray-300">{statusConfig[addon.status].label}</span>
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">{addon.description}</p>
        </div>
        <p className="text-xs text-gray-500 font-mono mt-auto">{addon.code}</p>
    </div>
);

export const Quantum: React.FC<{ quantumAddons: QuantumAddon[] }> = ({ quantumAddons }) => {
    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
                <QuantumIcon className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Quantum Core & Add-ons</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quantumAddons.map(addon => <AddonCard key={addon.name} addon={addon} />)}
            </div>
        </div>
    );
};