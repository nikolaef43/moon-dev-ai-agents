import React from 'react';
import { BoardEvent, ModelVote, AIBoardModel } from '../types';
import { GavelIcon } from '../components/icons';

const modelColorMap: Record<AIBoardModel, string> = {
    'DeepSeek-V2': 'text-purple-400',
    'Qwen-Max': 'text-blue-400',
    'GPT-4o': 'text-green-400',
    'Grok-2': 'text-yellow-400',
};

const decisionColorMap = {
    approve: 'text-green-400',
    reject: 'text-red-400',
    hold: 'text-yellow-400',
}

const VoteCard: React.FC<{ vote: ModelVote }> = ({ vote }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center">
            <h4 className={`font-bold font-mono ${modelColorMap[vote.modelName]}`}>{vote.modelName}</h4>
            <span className={`text-sm font-bold ${decisionColorMap[vote.decision]}`}>{vote.decision.toUpperCase()}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">Confidence: {(vote.confidence * 100).toFixed(1)}%</div>
        <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-1">Reasoning Tokens:</p>
            <div className="flex flex-wrap gap-1">
                {vote.r_tokens.map(token => (
                    <span key={token} className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                        {token}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

const BoardEventCard: React.FC<{ event: BoardEvent }> = ({ event }) => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 animate-fade-in">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-mono text-sm text-white">{event.agentRequest.agentId}: <span className="text-gray-400">{event.agentRequest.task}</span></p>
                    <p className="text-xs text-gray-500 font-mono">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
                {event.conflictDetected && (
                    <div className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-900/50 text-yellow-400">
                        CONFLICT
                    </div>
                )}
            </div>

            <h3 className="text-sm font-semibold text-gray-400 mb-2">Model Votes:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {event.votes.map(vote => <VoteCard key={vote.modelName} vote={vote} />)}
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Final Adjudicated Decision:</h3>
                <div className="flex items-center justify-between">
                    <span className={`text-xl font-bold ${decisionColorMap[event.finalDecision.decision]}`}>{event.finalDecision.decision.toUpperCase()}</span>
                    <div>
                        <span className="text-xs text-gray-400">Consensus Score: </span>
                        <span className="text-lg font-bold text-white">{event.consensusScore.toFixed(3)}</span>
                    </div>
                </div>
                <p className="text-xs text-gray-300 mt-1">{event.finalDecision.reasoning}</p>
            </div>
        </div>
    );
};

export const Boardroom: React.FC<{ boardEvents: BoardEvent[] }> = ({ boardEvents }) => {
    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
                <GavelIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">AI Boardroom: Live Decision Feed</h1>
            </div>
             <p className="text-sm text-gray-400 mb-6 max-w-4xl">
                Real-time stream of high-level governance decisions from the AI Board of Directors. Each event represents a full consensus cycle for a strategic agent request.
            </p>

            <div className="space-y-4">
                {boardEvents.length > 0 ? (
                    boardEvents.map(event => <BoardEventCard key={event.id} event={event} />)
                ) : (
                    <div className="bg-gray-800/50 p-10 rounded-lg border border-dashed border-gray-700 flex items-center justify-center">
                        <p className="text-gray-500">Awaiting first Board decision event...</p>
                    </div>
                )}
            </div>
        </div>
    );
};