/**
 * Risk utility helpers for formatting and categorizing risk metrics
 */

export const getRiskCategory = (score) => {
  if (score === undefined || score === null) return { level: 'UNKNOWN', color: 'slate', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-700' };
  
  if (score > 0.7) {
    return {
      level: 'HIGH',
      label: 'High Disruption Risk',
      color: 'rose',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      badgeBg: 'bg-rose-500/20',
      stroke: '#f43f5e',
      glow: 'glow-rose',
    };
  } else if (score > 0.4) {
    return {
      level: 'MEDIUM',
      label: 'Moderate Risk',
      color: 'amber',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20',
      stroke: '#f59e0b',
      glow: 'glow-amber',
    };
  } else {
    return {
      level: 'LOW',
      label: 'Low Disruption Risk',
      color: 'emerald',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/20',
      stroke: '#10b981',
      glow: 'glow-emerald',
    };
  }
};

export const formatPercent = (val) => {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  // If val is decimal 0-1 vs 0-100
  const pct = val <= 1 ? val * 100 : val;
  return `${pct.toFixed(1)}%`;
};
