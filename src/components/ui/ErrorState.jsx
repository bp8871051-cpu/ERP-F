import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Failed to load dashboard data',
  message = 'There was an issue communicating with the ERP API server. Please verify your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="bg-white border border-rose-200/80 rounded-xl p-8 text-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="teal"
          size="sm"
          icon={RefreshCw}
          onClick={onRetry}
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
