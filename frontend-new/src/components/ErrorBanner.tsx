import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'API Communication Error',
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-2 text-rose-200 shadow-lg">
      <div className="flex items-center gap-2 font-semibold text-sm text-rose-400">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{title}</span>
      </div>
      <p className="text-xs font-mono text-rose-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-mono font-medium text-rose-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
