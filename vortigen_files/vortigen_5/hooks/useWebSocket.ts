// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { Activity } from '../types';

// Use a generic handler type for flexibility
type MessageHandler = (data: any) => void;

// --- Mock Data for Simulation ---
const mockActivities: Omit<Activity, 'id' | 'timestamp'>[] = [
    { type: 'DECISION', message: 'High conviction signal on NVDA. Momentum score: 92.', agent: 'QuantStrategist' },
    { type: 'ALERT', message: 'Portfolio correlation with SPY has increased to 0.85.', agent: 'CorrelationRiskAgent' },
    { type: 'EXECUTION', message: 'Short Straddle on QQQ executed successfully.', agent: 'OptionsAgent', temporalAlpha: parseFloat((Math.random() * 2).toFixed(2)) },
    { type: 'SYSTEM', message: 'MutationAgent evolved new variation #5821 for WPR+BB.', agent: 'MutationAgent' },
    { type: 'ALERT', message: 'VIX z-score dropped to -2.1. Recommending Long Straddle.', agent: 'VolatilityRegimeAgent' },
    { type: 'EXECUTION', message: 'Risk Parity portfolio rebalanced. New weights applied.', agent: 'RiskParityAgent' },
    { type: 'DECISION', message: 'Market regime shifted to volatile_bear. Activating defensive posture.', agent: 'RegimeDetectionAgent'},
];


const useWebSocket = (url: string, onMessage: MessageHandler, isEnabled: boolean) => {
    // Keep the ref for potential future re-enabling of real WebSocket
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!isEnabled) {
            console.log('WebSocket simulation is paused.');
            return;
        }

        console.log('WebSocket connection is being SIMULATED. No real backend is required.');

        // Simulate receiving a new activity every few seconds
        const activityInterval = setInterval(() => {
            const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
            const newActivity: Activity = {
                ...randomActivity,
                id: Date.now(),
                timestamp: new Date().toISOString(),
            };
            onMessage({ type: 'NEW_ACTIVITY', payload: newActivity });
        }, 4000); // Simulate a new log every 4 seconds

        // Simulate agent decisions completing occasionally, which resets the "Processing..." button
        const decisionInterval = setInterval(() => {
            const randomActivity = mockActivities.find(a => a.type === 'DECISION' || a.type === 'EXECUTION');
            if (randomActivity) {
                 const activityPayload: Activity = {
                    ...randomActivity,
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                 };
                 // This message type resets the "Processing..." state on the manual cycle button
                 onMessage({ type: 'AGENT_DECISION_COMPLETE', payload: activityPayload });
            }
        }, 10000); // Simulate a decision completion every 10 seconds

        // Cleanup function to clear intervals when the component unmounts
        return () => {
            console.log('Stopping WebSocket simulation.');
            clearInterval(activityInterval);
            clearInterval(decisionInterval);
        };
    }, [url, onMessage, isEnabled]);
};

export default useWebSocket;