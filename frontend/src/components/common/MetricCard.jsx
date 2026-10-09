import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'cyan' }) {
  const getColorClasses = () => {
    switch (color) {
      case 'rose':
        return { border: 'hover:border-rose-500/40', iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'amber':
        return { border: 'hover:border-amber-500/40', iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'emerald':
        return { border: 'hover:border-emerald-500/40', iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      default:
        return { border: 'hover:border-cyan-500/40', iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    }
  };

  const style = getColorClasses();

  return (
    <div className={`p-5 rounded-xl bg-slate-900/90 border border-slate-800 transition-all ${style.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${style.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-mono font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>
      )}
    </div>
  );
}
