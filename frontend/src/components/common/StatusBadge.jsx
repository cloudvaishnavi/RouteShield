import React from 'react';

export default function StatusBadge({ status, type = 'risk' }) {
  const getStyle = () => {
    const s = String(status || '').toUpperCase();
    if (type === 'risk') {
      if (s === 'HIGH' || s === 'CRITICAL') return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      if (s === 'MEDIUM' || s === 'MODERATE') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (type === 'decision') {
      if (s === 'REROUTE') return 'bg-rose-500/15 text-rose-300 border-rose-500/40 font-bold';
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold';
    }
    if (type === 'agent') {
      if (s === 'COMPLETED' || s === 'SUCCESS') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      if (s === 'RUNNING' || s === 'PROCESSING') return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse';
      return 'bg-slate-800 text-slate-400 border-slate-700';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getStyle()}`}>
      {status || 'UNKNOWN'}
    </span>
  );
}
