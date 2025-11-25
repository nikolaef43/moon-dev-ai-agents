import React, { useState, useRef } from 'react';
import { X, CheckSquare, Square, Loader2, Printer } from 'lucide-react';
import { AppState } from '../types';
import { generateHtmlReport } from '../services/geminiService';

interface GenerateReportModalProps {
    show: boolean;
    onClose: () => void;
    appState: AppState;
}

const reportSections = [
    { id: 'overview', label: 'Portfolio Overview' },
    { id: 'positions', label: 'Open Positions' },
    { id: 'agents', label: 'AI Agent Health' },
    { id: 'insights', label: 'Top AI Insights' },
    { id: 'risk', label: 'Risk Analysis' },
];

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ show, onClose, appState }) => {
    const [step, setStep] = useState<'configure' | 'preview'>('configure');
    const [selectedSections, setSelectedSections] = useState<string[]>(['overview', 'positions', 'agents']);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportHtml, setReportHtml] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleClose = () => {
        onClose();
        // Reset state after a delay to allow for closing animation
        setTimeout(() => {
            setStep('configure');
            setReportHtml(null);
            setIsGenerating(false);
        }, 300);
    };

    const handleToggleSection = (sectionId: string) => {
        setSelectedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        
        const reportData: { [key: string]: any } = {};

        if (selectedSections.includes('overview')) {
            reportData.overview = {
                portfolioValue: appState.portfolioValue,
                dailyPnl: appState.dailyPnl,
                dailyPnlPercent: appState.dailyPnlPercent,
            };
        }
        if (selectedSections.includes('positions')) {
            reportData.positions = appState.positions.map(({ symbol, qty, entryPrice, current, pnl, pnlPercent }) => ({ symbol, qty, entryPrice, current, pnl, pnlPercent }));
        }
        if (selectedSections.includes('agents')) {
            reportData.agents = appState.aiAgents.map(({ name, health, accuracy, latency, trades }) => ({ name, health, accuracy, latency, trades }));
        }
        if (selectedSections.includes('insights')) {
            reportData.insights = appState.insights.slice(0, 5).map(({agent, text, confidence}) => ({agent, text, confidence}));
        }
        if (selectedSections.includes('risk')) {
            // In a real app, this data would be fetched or available in state
            reportData.risk = {
                var95: appState.portfolioValue * 0.041,
                stressTestImpact: -appState.portfolioValue * 0.18,
            };
        }

        const html = await generateHtmlReport(reportData);
        setReportHtml(html);
        setIsGenerating(false);
        setStep('preview');
    };

    const handlePrint = () => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 no-print" onClick={handleClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-xl font-bold">
                        {step === 'configure' ? 'Generate Dashboard Report' : 'Report Preview'}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-full transition"><X size={20} /></button>
                </div>

                {step === 'configure' && (
                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div>
                            <h3 className="font-semibold text-slate-300 mb-3">Select sections to include:</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {reportSections.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => handleToggleSection(section.id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition ${selectedSections.includes(section.id) ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    >
                                        {selectedSections.includes(section.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        <span>{section.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || selectedSections.length === 0}
                            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isGenerating ? <><Loader2 className="animate-spin" size={18} /> Generating Report...</> : 'Generate Report'}
                        </button>
                    </div>
                )}

                {step === 'preview' && (
                    <>
                        <div className="flex-grow p-2 bg-slate-800 overflow-hidden">
                            {reportHtml ? (
                                <iframe
                                    ref={iframeRef}
                                    srcDoc={reportHtml}
                                    className="w-full h-full border-0"
                                    title="Report Preview"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <p>Failed to load report preview.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-800 flex-shrink-0">
                            <button
                                onClick={handlePrint}
                                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold flex items-center justify-center gap-2"
                            >
                                <Printer size={18} /> Print Report
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GenerateReportModal;
