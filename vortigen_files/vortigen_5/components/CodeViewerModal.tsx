
import React, { useState } from 'react';
import { X, Code, CheckCircle, Copy } from 'lucide-react';

interface CodeViewerModalProps {
    code: string;
    title: string;
    onClose: () => void;
    language?: string;
}

const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ code, title, onClose, language = 'typescript' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900 rounded-t-xl">
                    <h2 className="text-lg font-bold flex items-center gap-3">
                        <Code className="text-cyan-400" /> {title}
                    </h2>
                    <div className="flex items-center gap-2">
                         <button onClick={handleCopy} className="p-2 hover:bg-slate-800 rounded-lg transition flex items-center gap-2 text-sm font-semibold text-slate-300">
                            {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-[#0d1117] font-mono text-xs text-slate-300">
                    <pre className={`language-${language}`}>
                        <code>{code || '// No code available'}</code>
                    </pre>
                </div>
                <div className="p-2 bg-slate-900 border-t border-slate-800 text-xs text-slate-500 flex justify-between px-4">
                    <span>{language.toUpperCase()}</span>
                    <span>{code.split('\n').length} lines</span>
                </div>
            </div>
        </div>
    );
};

export default CodeViewerModal;
