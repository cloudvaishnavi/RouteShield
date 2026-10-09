import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Service Interruption', message = 'Unable to connect to RouteShield prediction backend.', onRetry }) {
  return (
    <div className="p-8 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-rose-300">{title}</h3>
        <p className="text-sm text-slate-300 mt-1 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/40 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
