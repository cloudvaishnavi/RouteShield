import React from 'react';
import { getRiskCategory, formatPercent } from '../../utils/riskUtils';
import { ShieldAlert, Cpu } from 'lucide-react';

export default function RiskGauge({ riskScore = 0.365, confidence = 0.835, isDisrupted = false }) {
  const category = getRiskCategory(riskScore);
  const percentage = Math.round(riskScore <= 1 ? riskScore * 100 : riskScore);
  
  // Circumference calculation for SVG progress circle
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col items-center text-center relative overflow-hidden">
      {/* Background Subtle Radial Glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${category.bg} opacity-20 pointer-events-none`} />

      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Predictive Risk Telemetry
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${category.badgeBg} ${category.text} ${category.border}`}>
          {category.level} RISK TIER
        </span>
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative my-2 flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated Risk progress ring */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={category.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Gauge Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
            {percentage}%
          </span>
          <span className="text-[11px] font-mono text-slate-400 uppercase mt-0.5">
            Disruption Risk
          </span>
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-slate-800/80 font-mono text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Model Classification</div>
          <div className={`font-bold mt-0.5 ${isDisrupted ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isDisrupted ? 'DISRUPTION LIKELY' : 'NO DISRUPTION'}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] text-slate-400">Certainty Index</div>
          <div className="font-bold text-cyan-400 mt-0.5">
            {formatPercent(confidence)} Confidence
          </div>
        </div>
      </div>
    </div>
  );
}
