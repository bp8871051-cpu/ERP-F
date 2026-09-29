import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Falcon ERP - Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = '/app/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Something Went Wrong</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected UI rendering issue occurred. Your data in Falcon ERP is safe and preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left overflow-auto max-h-36 text-[11px] text-slate-700 font-mono">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                onClick={this.handleGoDashboard}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
