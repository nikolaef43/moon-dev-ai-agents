import React from 'react';
import { ModelRoute, AIBoardMember, AIBoardMemberStatus, AIBoardModel } from '../types';
import { RouterIcon } from '../components/icons';

const modelColorMap: Record<AIBoardModel, string> = {
    'DeepSeek-V2': 'text-purple-400',
    'Qwen-Max': 'text-blue-400',
    'GPT-4o': 'text-green-400',
    'Grok-2': 'text-yellow-400',
};

const statusColorMap: Record<AIBoardMemberStatus, string> = {
    Online: 'bg-green-500',
    Recalibrating: 'bg-yellow-500',
    Offline: 'bg-red-500',
};

const ModelTag: React.FC<{ modelName: AIBoardModel, boardMembers: AIBoardMember[] }> = ({ modelName, boardMembers }) => {
    const member = boardMembers.find(m => m.modelName === modelName);
    const status = member?.status || 'Offline';
    const color = modelColorMap[modelName] || 'text-gray-400';
    
    return (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusColorMap[status]}`}></span>
            <span className={`font-mono font-semibold ${color}`}>{modelName}</span>
        </div>
    );
};


const RouteCard: React.FC<{ route: ModelRoute, boardMembers: AIBoardMember[] }> = ({ route, boardMembers }) => {
    return (
        <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2 font-mono">{route.taskType}</h3>
            <p className="text-sm text-gray-400 mb-4 flex-grow">{route.description}</p>
            <div className="space-y-3 border-t border-gray-700 pt-4 mt-2">
                <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Primary Model</p>
                    <ModelTag modelName={route.primaryModel} boardMembers={boardMembers} />
                </div>
                {route.fallbackModel && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Fallback Model</p>
                        <ModelTag modelName={route.fallbackModel} boardMembers={boardMembers} />
                    </div>
                )}
            </div>
        </div>
    );
};

export const Router: React.FC<{ modelRoutes: ModelRoute[], boardMembers: AIBoardMember[] }> = ({ modelRoutes, boardMembers }) => {
    const tradeRoutes = modelRoutes.filter(r => r.taskType === 'TRADE_ADVICE' || r.taskType === 'EXECUTION_ADVICE');
    const cognitiveRoutes = modelRoutes.filter(r => r.taskType !== 'TRADE_ADVICE' && r.taskType !== 'EXECUTION_ADVICE');

    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
                <RouterIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">AI Core Model Router</h1>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-4xl">
                The Model Router directs internal AI tasks to the most suitable model from the AI Board of Directors. This ensures optimal performance, cost, and safety by leveraging each model's specialized strengths.
            </p>
            
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Strategic Trading & Execution</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {tradeRoutes.map(route => <RouteCard key={route.taskType} route={route} boardMembers={boardMembers} />)}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Cognitive & Safety Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {cognitiveRoutes.map(route => <RouteCard key={route.taskType} route={route} boardMembers={boardMembers} />)}
                </div>
            </div>
        </div>
    );
};