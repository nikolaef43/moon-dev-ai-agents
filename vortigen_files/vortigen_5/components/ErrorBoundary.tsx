import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">System Critical Failure</h1>
            <p className="text-slate-400 mb-6 text-sm">
              The VORTIGEN interface encountered an unexpected anomaly. The circuit breaker has tripped to protect the core state.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 rounded p-3 mb-6 text-left overflow-auto max-h-32">
                <code className="text-xs font-mono text-red-400">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <button 
              onClick={this.handleReload}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              <RefreshCw size={18} />
              Reinitialize System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;