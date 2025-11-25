import React from 'react';
import { ConsensusSignal, Agent, VoteDecision } from '../types';
import { ConsensusIcon } from '../components/icons';

const VoteBar: React.FC<{ signal: ConsensusSignal }> = ({ signal }) => {
    const totalEligible = signal.eligibleVoters.length;
    if (totalEligible === 0) return null; // Avoid division by zero

    const yesVotes = signal.votes.filter(v => v.decision === 'yes').length;
    const noVotes = signal.votes.filter(v => v.decision === 'no').length;
    const abstainVotes = signal.votes.filter(v => v.decision === 'abstain').length;

    const yesPct = (yesVotes / totalEligible) * 100;
    const noPct = (noVotes / totalEligible) * 100;
    const abstainPct = (abstainVotes / totalEligible) * 100;
    
    const majorityThresholdPct = (Math.ceil(totalEligible / 2) / totalEligible) * 100;

    return (
        <div className="w-full bg-gray-700 rounded-full h-4 my-2 relative overflow-hidden">
            <div className="absolute top-0 h-full border-r-2 border-dashed border-gray-900" style={{ left: `${majorityThresholdPct}%` }}></div>
            <div className="flex h-full">
                <div className="bg-green-500 h-full" style={{ width: `${yesPct}%` }}></div>
                <div className="bg-red-500 h-full" style={{ width: `${noPct}%` }}></div>
                <div className="bg-gray-500 h-full" style={{ width: `${abstainPct}%` }}></div>
            </div>
        </div>
    );
};


const PendingSignalCard: React.FC<{ signal: ConsensusSignal, agents: Agent[] }> = ({ signal, agents }) => {
    const yesVotes = signal.votes.filter(v => v.decision === 'yes').length;
    const noVotes = signal.votes.filter(v => v.decision === 'no').length;
    const abstainVotes = signal.votes.filter(v => v.decision === 'abstain').length;
    const proposingAgent = agents.find(a => a.id === signal.proposingAgentId);
    
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border-l-4 border-yellow-400">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-xl font-bold ${signal.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>{signal.side.toUpperCase()} {signal.symbol}</h3>
                    <p className="text-sm text-gray-400">Strategy: {signal.strategy}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Proposed by: {signal.proposingAgentId} (Fitness: {proposingAgent?.fitnessScore.toFixed(3)})</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-white">{signal.votes.length} / {signal.eligibleVoters.length}</p>
                    <p className="text-xs text-gray-400">Votes Received</p>
                </div>
            </div>

            <VoteBar signal={signal} />
            
            <div className="flex justify-between text-xs mt-1">
                <span className="text-green-400">{yesVotes} Yes</span>
                <span className="text-red-400">{noVotes} No</span>
                <span className="text-gray-400">{abstainVotes} Abstain</span>
                <span className="text-yellow-400 border-l border-gray-600 pl-2">Majority at {Math.ceil(signal.eligibleVoters.length / 2)}</span>
            </div>
        </div>
    );
};

const ResolvedSignalRow: React.FC<{ signal: ConsensusSignal }> = ({ signal }) => {
    const yesVotes = signal.votes.filter(v => v.decision === 'yes').length;
    const noVotes = signal.votes.filter(v => v.decision === 'no').length;
    const isApproved = signal.status === 'approved';

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50">
            <td className="p-3 text-xs text-gray-500 font-mono">{new Date(signal.resolvedTimestamp!).toLocaleString()}</td>
            <td className={`p-3 text-sm font-semibold ${isApproved ? 'text-green-400' : 'text-red-400'}`}>{signal.status.toUpperCase()}</td>
            <td className={`p-3 text-sm font-semibold ${signal.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>{signal.side} {signal.symbol}</td>
            <td className="p-3 text-sm text-gray-400">{signal.strategy}</td>
            <td className="p-3 text-sm text-gray-300 font-mono">{signal.proposingAgentId}</td>
            <td className="p-3 text-sm text-center">
                <span className="text-green-400">{yesVotes}</span> / <span className="text-red-400">{noVotes}</span>
            </td>
        </tr>
    );
};

export const Consensus: React.FC<{ consensusSignals: ConsensusSignal[], agents: Agent[] }> = ({ consensusSignals, agents }) => {
    const pendingSignals = consensusSignals.filter(s => s.status === 'pending');
    const resolvedSignals = consensusSignals.filter(s => s.status !== 'pending').sort((a, b) => new Date(b.resolvedTimestamp!).getTime() - new Date(a.resolvedTimestamp!).getTime());

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
            <div className="flex items-center gap-3">
                <ConsensusIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Swarm Trade Consensus</h1>
            </div>
            
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Pending Signals</h2>
                {pendingSignals.length > 0 ? (
                    <div className="space-y-4">
                        {pendingSignals.map(signal => <PendingSignalCard key={signal.id} signal={signal} agents={agents} />)}
                    </div>
                ) : (
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-dashed border-gray-700 flex items-center justify-center">
                        <p className="text-gray-500">No active trade signals awaiting consensus. System is monitoring.</p>
                    </div>
                )}
            </div>

            <div className="flex-grow">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Decisions</h2>
                <div className="overflow-y-auto bg-gray-800/50 rounded-lg border border-gray-700">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-900">
                            <tr className="border-b border-gray-600">
                                <th className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Outcome</th>
                                <th className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Signal</th>
                                <th className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Strategy</th>
                                <th className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Proposer</th>
                                <th className="p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Vote (Y/N)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resolvedSignals.map(signal => <ResolvedSignalRow key={signal.id} signal={signal} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};