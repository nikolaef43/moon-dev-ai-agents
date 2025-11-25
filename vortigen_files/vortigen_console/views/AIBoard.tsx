import React from 'react';
import { AIBoardState, AIBoardMember, AIBoardMemberStatus } from '../types';
import { AIBoardIcon } from '../components/icons';

const StatCard: React.FC<{ title: string; value: string | number; color?: string }> = ({ title, value, color = 'text-white' }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const statusColorMap: Record<AIBoardMemberStatus, string> = {
    Online: 'bg-green-500',
    Recalibrating: 'bg-yellow-500',
    Offline: 'bg-red-500',
};

const BoardMemberCard: React.FC<{ member: AIBoardMember }> = ({ member }) => (
    <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
        <div>
            <h4 className="font-bold text-blue-400">{member.modelName}</h4>
            <p className="text-xs text-gray-400">{member.role}</p>
        </div>
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusColorMap[member.status]}`}></span>
            <span className="text-sm text-gray-300">{member.status}</span>
        </div>
    </div>
);

export const AIBoard: React.FC<{ aiBoardState: AIBoardState }> = ({ aiBoardState }) => {
    const activeMembers = aiBoardState.members.filter(m => m.status === 'Online').length;
    const statusColor = aiBoardState.status === 'Nominal' ? 'text-green-400' : 'text-yellow-400';

    return (
        <div className="h-full flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
            <div className="flex items-center gap-3">
                <AIBoardIcon className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">AI Board of Directors</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Board Status" value={aiBoardState.status} color={statusColor} />
                <StatCard title="Active Models" value={`${activeMembers} / ${aiBoardState.members.length}`} />
                <StatCard title="Cost Projection" value={`$${aiBoardState.costProjection}/mo`} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Board Composition</h2>
                    <div className="space-y-3">
                        {aiBoardState.members.map(member => <BoardMemberCard key={member.id} member={member} />)}
                    </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Live Board Directives</h2>
                    <div className="font-mono text-xs bg-black/30 p-4 rounded-md h-48 overflow-y-auto space-y-2">
                        {aiBoardState.directives.length > 0 ? aiBoardState.directives.map(d => (
                             <p key={d.id}>
                                <span className="text-gray-500 mr-2">{new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span>
                                <span className="text-blue-400 font-semibold mr-2">[{d.sourceModel}]</span>
                                <span className="text-gray-300">{d.directive}</span>
                            </p>
                        )) : (
                            <p className="text-gray-500">> No recent directives. Board is monitoring.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};