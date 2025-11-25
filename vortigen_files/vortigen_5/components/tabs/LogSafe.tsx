import React, { useState } from 'react';
import { Archive, Bookmark, Trash2, Filter, XCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import DashboardCard from '../DashboardCard';
import { LogEntry } from '../../types';

const LogEntryCard: React.FC<{
    entry: LogEntry;
    onToggleSave: (id: number) => void;
    onDelete: (id: number) => void;
}> = ({ entry, onToggleSave, onDelete }) => {
    
    return (
        <div className={`bg-slate-900 rounded-lg border ${entry.saved ? 'border-cyan-500/50' : 'border-slate-800'} p-4 flex flex-col`}>
             <div className="flex justify-between items-start gap-4 mb-3">
                 <div className="flex-shrink-0">
                     {entry.mediaType === 'image' ? (
                        <img src={entry.mediaPreviewUrl} alt="Analyzed media" className="w-24 h-24 object-cover rounded-md" />
                     ) : (
                        <video src={entry.mediaPreviewUrl} className="w-24 h-24 object-cover rounded-md" />
                     )}
                 </div>
                 <div className="flex-grow">
                     <p className="text-xs text-slate-500 mb-1">{new Date(entry.timestamp).toLocaleString()}</p>
                     <p className="text-sm font-semibold text-slate-300 italic">"{entry.prompt}"</p>
                 </div>
             </div>
             <div className="bg-slate-800/50 p-3 rounded-md flex-grow mb-3">
                 <p className="text-xs text-slate-400 whitespace-pre-wrap">{entry.response}</p>
             </div>
             <div className="flex items-center justify-end gap-2">
                 <button 
                    onClick={() => onToggleSave(entry.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${entry.saved ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                     <Bookmark size={12} /> {entry.saved ? 'Saved' : 'Save'}
                 </button>
                 <button 
                    onClick={() => onDelete(entry.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                >
                     <Trash2 size={12} /> Delete
                 </button>
             </div>
        </div>
    );
};

const LogSafe: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { logSafeEntries } = state;
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    const filteredEntries = showSavedOnly ? logSafeEntries.filter(e => e.saved) : logSafeEntries;

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to permanently delete this log entry? This action cannot be undone.')) {
            dispatch({ type: 'DELETE_LOG_ENTRY', payload: { id } });
        }
    };

    const handleToggleSave = (id: number) => {
        dispatch({ type: 'TOGGLE_SAVE_LOG_ENTRY', payload: { id } });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Archive size={28} className="text-cyan-400" /> Log Safe
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSavedOnly(!showSavedOnly)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                            showSavedOnly
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        <Filter size={14}/>
                        Show Saved Only
                    </button>
                </div>
            </div>
            
            <p className="text-slate-400 text-sm">
                A secure vault of all media analyses performed by the Visual Analysis Engine. Review, save, or delete entries as needed.
            </p>

            {filteredEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntries.map(entry => (
                        <LogEntryCard 
                            key={entry.id} 
                            entry={entry} 
                            onToggleSave={handleToggleSave}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500 bg-slate-900 rounded-lg border border-dashed border-slate-700">
                    {logSafeEntries.length === 0 
                        ? <p>No analyses have been logged yet. Use the Visual Analysis tab to get started.</p>
                        : <p>No saved entries match the filter.</p>
                    }
                </div>
            )}
        </div>
    );
};

export default LogSafe;