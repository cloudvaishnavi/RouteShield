import React from 'react';
import { RefreshCw, Cpu } from 'lucide-react';

export default function LoadingState({ title = 'Processing Request...', message = 'Communicating with RouteShield ML Engine...' }) {
  return (
    <div className="p-12 rounded-xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-cyan-500 animate-spin"></div>
        <Cpu className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-md">{message}</p>
      </div>
    </div>
  );
}
