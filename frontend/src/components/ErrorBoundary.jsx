import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });

        // Log to error tracking service (e.g., Sentry) in production
        if (process.env.NODE_ENV === 'production') {
            // logErrorToService(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary)',
                    padding: '20px'
                }}>
                    <div className="glass-panel card" style={{ maxWidth: '600px', width: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{
                                fontSize: '4rem',
                                marginBottom: '20px'
                            }}>⚠️</div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Something went wrong</h1>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                The application encountered an unexpected error.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div style={{
                                background: 'var(--bg-primary)',
                                padding: '15px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                overflowX: 'auto'
                            }}>
                                <div style={{ color: 'var(--danger)', marginBottom: '10px', fontWeight: 600 }}>
                                    {this.state.error.toString()}
                                </div>
                                {this.state.errorInfo && (
                                    <pre style={{
                                        color: 'var(--text-secondary)',
                                        margin: 0,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                className="btn-primary"
                                onClick={this.handleReset}
                                style={{ flex: 1 }}
                            >
                                Try Again
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => window.location.reload()}
                                style={{ flex: 1 }}
                            >
                                Reload Page
                            </button>
                        </div>

                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <strong>💡 Tip:</strong> If this error persists, try:
                            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                <li>Checking if the backend server is running</li>
                                <li>Clearing your browser cache</li>
                                <li>Checking the browser console for more details</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
