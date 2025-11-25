import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContainer = () => {
    const { state, dispatch, ActionTypes } = useApp();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <XCircle size={20} />;
            case 'warning':
                return <AlertCircle size={20} />;
            case 'info':
            default:
                return <Info size={20} />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'success':
                return 'var(--success)';
            case 'error':
                return 'var(--danger)';
            case 'warning':
                return '#f59e0b';
            case 'info':
            default:
                return 'var(--accent-primary)';
        }
    };

    const handleDismiss = (id) => {
        dispatch({
            type: ActionTypes.REMOVE_NOTIFICATION,
            payload: id
        });
    };

    if (state.notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px',
            width: '100%'
        }}>
            {state.notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="glass-panel"
                    style={{
                        padding: '15px 20px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        borderLeft: `3px solid ${getColor(notification.type)}`,
                        animation: 'slideInRight 0.3s ease-out',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    <div style={{ color: getColor(notification.type), flexShrink: 0, marginTop: '2px' }}>
                        {getIcon(notification.type)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {notification.title && (
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                {notification.title}
                            </div>
                        )}
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            wordBreak: 'break-word'
                        }}>
                            {notification.message}
                        </div>
                    </div>

                    <button
                        onClick={() => handleDismiss(notification.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

// Add animation to index.css
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

export default NotificationContainer;
