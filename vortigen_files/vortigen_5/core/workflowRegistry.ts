

import { WorkflowNode } from '../types';

export const workflowNodes: WorkflowNode[] = [
    { id: 'start', type: 'input', name: 'Market Event Trigger', position: { x: 50, y: 150 } },
    { id: 'data', type: 'default', name: 'DataEngineer', position: { x: 250, y: 50 } },
    { id: 'sentiment', type: 'default', name: 'SocialSentimentAgent', position: { x: 250, y: 150 } },
    { id: 'regime', type: 'default', name: 'RegimeDetectionAgent', position: { x: 250, y: 250 } },
    { id: 'forum', type: 'processing', name: 'Agent Forum Debate', position: { x: 500, y: 150 } },
    { id: 'strategy', type: 'default', name: 'QuantStrategistAgent', position: { x: 700, y: 50 } },
    { id: 'risk', type: 'default', name: 'RiskOfficer', position: { x: 700, y: 250 } },
    { id: 'consensus', type: 'processing', name: 'Consensus & Signal', position: { x: 900, y: 150 } },
    { id: 'execution', type: 'default', name: 'ExecutionOptimizerAgent', position: { x: 1100, y: 150 } },
    { id: 'end', type: 'output', name: 'Trade Executed', position: { x: 1300, y: 150 } },
];

export const workflowEdges = [
    { from: 'start', to: 'data' },
    { from: 'start', to: 'sentiment' },
    { from: 'start', to: 'regime' },
    { from: 'data', to: 'forum' },
    { from: 'sentiment', to: 'forum' },
    { from: 'regime', to: 'forum' },
    { from: 'forum', to: 'strategy' },
    { from: 'forum', to: 'risk' },
    { from: 'strategy', to: 'consensus' },
    { from: 'risk', to: 'consensus' },
    { from: 'consensus', to: 'execution' },
    { from: 'execution', to: 'end' },
];