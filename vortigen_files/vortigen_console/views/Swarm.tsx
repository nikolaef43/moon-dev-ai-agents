import React from 'react';
import { CollectiveState, Sentiment } from '../types';
// fix: Replaced non-existent SwarmIcon with CollectiveIcon to resolve import error.
import { CollectiveIcon, AgentsIcon } from '../components/icons';

const sentimentConfig: Record<Sentiment, { color: string; description: string }> = {
    'Aggressive Growth': { color: 'text-red-400', description: 'Maximizing alpha generation, high risk tolerance.' },
    'Calculated Risk': { color: 'text-yellow-400', description: 'Targeting favorable risk/reward opportunities.' },
    'Neutral': { color: 'text-gray-300', description: 'Market-neutral stance, hedging active.' },
    'Risk-Averse': { color: 'text-blue-400', description: 'Capital preservation focus, low net exposure.' },
    'Defensive': { color: 'text-green-400', description: 'Actively hedging tail risk, minimizing drawdowns.' }
};

export const Collective: React.FC<{ collectiveState: CollectiveState }> = ({ collectiveState }) => {
    const sentiment = sentimentConfig[collectiveState.sentiment];

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
            <div className="flex items-center gap-3">
                <CollectiveIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Swarm Intelligence Overview</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-1">Current Collective Sentiment</h2>
                    <p className={`text-2xl font-bold ${sentiment.color}`}>{collectiveState.sentiment}</p>
                    <p className="text-sm text-gray-400 mt-1">{sentiment.description}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                     <h2 className="text-lg font-semibold text-white mb-2">Operational Focus</h2>
                     <p className="text-base text-gray-300">{collectiveState.operationalFocus}</p>
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-3">Last Synaptic Meeting Summary</h2>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{collectiveState.lastMeetingSummary}</p>
            </div>
            
             <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Active Cross-Agent Task Forces</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collectiveState.activeTaskForces.map(tf => (
                        <div key={tf.name} className="bg-gray-900/50 p-4 rounded-md">
                            <h3 className="font-semibold text-blue-400">{tf.name}</h3>
                            <p className="text-xs text-gray-400 mt-1 mb-2">{tf.objective}</p>
                            <div className="flex items-center gap-2">
                                <AgentsIcon className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-300 font-mono">{tf.members.join(', ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};