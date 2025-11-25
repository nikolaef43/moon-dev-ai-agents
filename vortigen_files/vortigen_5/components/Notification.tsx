import React, { useEffect } from 'react';
import { Info, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Notification: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { notification } = state;

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                dispatch({ type: 'HIDE_NOTIFICATION' });
            }, 5000); // Auto-dismiss after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, dispatch]);

    if (!notification) {
        return null;
    }

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle className="text-green-400" size={20} />;
            case 'error':
                return <XCircle className="text-red-400" size={20} />;
            case 'info':
            default:
                return <Info className="text-blue-400" size={20} />;
        }
    };

    const getBorderColor = () => {
        switch (notification.type) {
            case 'success': return 'border-green-500/50';
            case 'error': return 'border-red-500/50';
            case 'info':
            default: return 'border-blue-500/50';
        }
    }

    return (
        <div 
            className={`fixed top-20 right-6 w-96 bg-slate-900/80 backdrop-blur-md border ${getBorderColor()} rounded-lg shadow-2xl z-[100] p-4 flex items-start gap-4 animate-fade-in-down`}
            role="alert"
        >
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-grow">
                <p className="text-sm font-semibold text-slate-100">{notification.message}</p>
            </div>
            <button onClick={() => dispatch({ type: 'HIDE_NOTIFICATION' })} className="text-slate-500 hover:text-white">
                <XCircle size={16} />
            </button>
        </div>
    );
};

export default Notification;