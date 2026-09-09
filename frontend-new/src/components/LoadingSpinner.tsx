import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading Satellite Data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center select-none font-mono">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-emerald-400 animate-spin" />
        <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-indigo-400 animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-xs text-slate-400 tracking-wider uppercase font-medium">{label}</p>
    </div>
  );
};
