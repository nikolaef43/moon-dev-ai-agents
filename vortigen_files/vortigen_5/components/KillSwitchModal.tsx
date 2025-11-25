import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const KillSwitchModal: React.FC = () => {
  const { state } = useAppContext();
  const { systemStatus } = state;

  // The modal is now self-sufficient and only cares about the global system status.
  if (systemStatus !== 'emergency_stop' && systemStatus !== 'stopped') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 border-2 border-red-500 rounded-lg p-8 text-center">
        <AlertTriangle className="text-red-500 mb-4 mx-auto" size={40} />
        <h3 className="text-2xl font-black text-red-500 mb-4">KILL SWITCH ACTIVATED</h3>
        <p className="text-slate-300">
          Emergency stop initiated. All trading halted immediately.
        </p>
         <p className="text-slate-300 mt-2">
            Status:{" "}
            <span className="font-bold text-yellow-400">{systemStatus.toUpperCase().replace('_', ' ')}</span>
        </p>
      </div>
    </div>
  );
};

export default KillSwitchModal;