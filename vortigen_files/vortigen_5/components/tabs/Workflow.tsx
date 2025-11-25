
import React from 'react';
import { Workflow as WorkflowIcon, ChevronRight } from 'lucide-react';
import { workflowNodes, workflowEdges } from '../../core/workflowRegistry';
import { WorkflowNode } from '../../types';

const Node: React.FC<{ node: WorkflowNode }> = ({ node }) => {
    const typeClasses = {
        default: 'bg-slate-800 border-slate-700',
        input: 'bg-green-900/50 border-green-500/50',
        output: 'bg-purple-900/50 border-purple-500/50',
        processing: 'bg-cyan-900/50 border-cyan-500/50',
    };
    const nodeType = node.type || 'default';
    
    return (
        <div
            className={`absolute px-4 py-3 rounded-lg border shadow-lg ${typeClasses[nodeType as keyof typeof typeClasses]}`}
            style={{ left: node.position.x, top: node.position.y, minWidth: 180 }}
        >
            <div className="font-bold text-sm text-center">{node.name}</div>
        </div>
    );
};

const Edge: React.FC<{ from: { x: number, y: number }, to: { x: number, y: number } }> = ({ from, to }) => {
    const fromNodeCenter = { x: from.x + 90, y: from.y + 25 };
    const toNodeCenter = { x: to.x + 90, y: to.y + 25 };
    
    const dx = toNodeCenter.x - fromNodeCenter.x;
    const dy = toNodeCenter.y - fromNodeCenter.y;
    const midX = fromNodeCenter.x + dx * 0.5;
    const midY = fromNodeCenter.y + dy * 0.5;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return (
        <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <path
                d={`M ${fromNodeCenter.x} ${fromNodeCenter.y} L ${toNodeCenter.x} ${toNodeCenter.y}`}
                stroke="#475569"
                strokeWidth="2"
                fill="none"
            />
            <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
                 <ChevronRight size={16} color="#475569" />
            </g>
        </svg>
    );
};


const Workflow: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
                <WorkflowIcon size={28} className="text-cyan-400" /> Agent Orchestration Workflow
            </h2>
            <p className="text-slate-400 text-sm">
                This is a high-level visualization of the autonomous agent workflow, from market event trigger to trade execution. 
                It demonstrates the collaborative, multi-step process inspired by frameworks like `Draft'n Run`.
            </p>
            <div className="w-full h-[600px] bg-slate-900 rounded-lg border border-slate-800 p-4 overflow-auto relative">
                 {workflowEdges.map((edge, i) => {
                    const fromNode = workflowNodes.find(n => n.id === edge.from);
                    const toNode = workflowNodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    return <Edge key={i} from={fromNode.position} to={toNode.position} />;
                })}
                {workflowNodes.map(node => <Node key={node.id} node={node} />)}
            </div>
        </div>
    );
};

export default Workflow;
