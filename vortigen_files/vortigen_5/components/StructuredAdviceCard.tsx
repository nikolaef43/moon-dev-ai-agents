
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, List, AlertCircle, Zap, Tag } from 'lucide-react';
import { UnifiedSchemaV2 } from '../types';

interface StructuredAdviceCardProps {
    advice: UnifiedSchemaV2;
    isMinimized?: boolean;
}

const StructuredAdviceCard: React.FC<StructuredAdviceCardProps> = ({ advice, isMinimized = false }) => {
    const recommendationMap = {
        approve: { text: 'Approve', color: 'text-green-400', icon: <CheckCircle size={18} /> },
        reject: { text: 'Reject', color: 'text-red-400', icon: <XCircle size={18} /> },
        buy: { text: 'Buy', color: 'text-green-400', icon: <CheckCircle size={18} /> },
        sell: { text: 'Sell', color: 'text-red-400', icon: <XCircle size={18} /> },
        hold: { text: 'Hold', color: 'text-yellow-400', icon: <AlertTriangle size={18} /> },
        escalate: { text: 'Escalate', color: 'text-purple-400', icon: <AlertTriangle size={18} /> },
        PROCEED: { text: 'Proceed', color: 'text-green-400', icon: <CheckCircle size={18} /> },
        REVISE: { text: 'Revise', color: 'text-yellow-400', icon: <AlertTriangle size={18} /> },
        HALT: { text: 'Halt', color: 'text-red-400', icon: <XCircle size={18} /> },
    };

    const { text, color, icon } = recommendationMap[advice.decision] || recommendationMap.hold;

    if (isMinimized) {
        return (
            <div className="space-y-1">
                 <div className="flex justify-between items-center">
                    <span className={`flex items-center gap-1.5 font-bold text-xs ${color}`}>{icon} {text}</span>
                    <span className="text-xs font-mono text-slate-500">Conf: {(advice.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-slate-400 italic">"{advice.reasoning}"</p>
                {advice.r_tokens && advice.r_tokens.length > 0 && (
                     <div className="flex flex-wrap gap-1 pt-1">
                        {advice.r_tokens.map((token, i) => (
                             <span key={i} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                                {token}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-md">
                <span className={`flex items-center gap-2 font-bold text-lg ${color}`}>{icon} {text}</span>
                <div>
                    <span className="text-xs text-slate-400">Confidence: </span>
                    <span className="font-bold text-base text-slate-200">{(advice.confidence * 100).toFixed(0)}%</span>
                </div>
            </div>

            <div>
                <h5 className="text-xs font-bold text-slate-400 mb-1">Reasoning</h5>
                <p className="p-2 bg-slate-900/50 rounded-md text-slate-300 italic">"{advice.reasoning}"</p>
            </div>
            
            {advice.r_tokens && advice.r_tokens.length > 0 && (
                <div>
                    <h5 className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1.5"><Tag size={12}/>Reasoning Tokens</h5>
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-900/50 rounded-md">
                        {advice.r_tokens.map((token, i) => (
                            <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md font-mono">
                                {token}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {advice.risks && advice.risks.length > 0 && (
                 <div>
                    <h5 className="text-xs font-bold text-red-400 mb-1 flex items-center gap-1.5"><AlertCircle size={12}/>Identified Risks</h5>
                    <ul className="list-disc list-inside space-y-1 p-2 bg-slate-900/50 rounded-md text-red-300/80">
                       {advice.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                </div>
            )}
            
             {advice.required_actions && advice.required_actions.length > 0 && (
                 <div>
                    <h5 className="text-xs font-bold text-yellow-400 mb-1 flex items-center gap-1.5"><List size={12}/>Required Actions</h5>
                    <ul className="list-disc list-inside space-y-1 p-2 bg-slate-900/50 rounded-md text-yellow-300/80">
                       {advice.required_actions.map((action, i) => <li key={i}>{action}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StructuredAdviceCard;
