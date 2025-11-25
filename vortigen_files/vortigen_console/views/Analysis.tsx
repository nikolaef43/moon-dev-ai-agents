import React from 'react';
import { Prediction } from '../types';
import { PredictionsIcon } from '../components/icons';

const PredictionCard: React.FC<{ pred: Prediction }> = React.memo(({ pred }) => {
    const decisionConfig = {
        Buy: { text: 'text-green-400', bg: 'bg-green-900/50', border: 'border-green-500' },
        Sell: { text: 'text-red-400', bg: 'bg-red-900/50', border: 'border-red-500' },
        Hold: { text: 'text-yellow-400', bg: 'bg-yellow-900/50', border: 'border-yellow-500' },
    };
    const style = decisionConfig[pred.decision];

    return (
        <div className={`bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col ${pred.passesFilters ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' : ''}`}>
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white">{pred.symbol} <span className="text-sm font-normal text-gray-400 ml-1">({pred.horizon})</span></h3>
                <div className={`px-3 py-1 text-xs font-bold rounded-full ${style.bg} ${style.text}`}>
                    {pred.decision.toUpperCase()}
                </div>
            </div>
             {pred.passesFilters && (
                <div className="text-center text-xs font-semibold text-blue-300 bg-blue-900/50 py-1 rounded-md my-2">
                    High Conviction Signal
                </div>
            )}
            <div className="grid grid-cols-2 gap-3 my-3 text-center">
                <div>
                    <p className="text-xs text-gray-400">Predicted Return</p>
                    <p className={`text-xl font-bold ${pred.predictedReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(pred.predictedReturn * 100).toFixed(2)}%
                    </p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400">Edge Score</p>
                    <p className="text-xl font-bold text-blue-400">
                        {pred.edgeScore.toFixed(4)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className="text-xl font-bold text-white">
                        {(pred.confidence * 100).toFixed(1)}%
                    </p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400">Prob. Positive</p>
                    <p className="text-xl font-bold text-white">
                        {(pred.probabilityPositive * 100).toFixed(1)}%
                    </p>
                </div>
            </div>
            <div className="mt-auto border-t border-gray-700 pt-3">
                <p className="text-xs text-gray-400 mb-2">Reasoning Tokens:</p>
                <div className="flex flex-wrap gap-1.5">
                    {pred.r_tokens.map(token => (
                        <span key={token} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {token}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
});


export const Predictions: React.FC<{ predictions: Prediction[] }> = ({ predictions }) => {
    return (
        <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <PredictionsIcon className="w-8 h-8 text-blue-400" />
                    <h1 className="text-2xl font-bold text-white">AI Prediction Matrix</h1>
                </div>
            </div>

            <p className="text-sm text-gray-400 mb-6 max-w-4xl">
                Live predictions from the AI core, incorporating multi-factor analysis and confidence scoring. High-conviction signals passing all statistical filters are highlighted for review.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {predictions.map(pred => (
                    <PredictionCard key={pred.id} pred={pred} />
                ))}
            </div>
        </div>
    );
};