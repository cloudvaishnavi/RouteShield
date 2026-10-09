import React from 'react';
import { HelpCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { humanizeFeatureName } from '../../utils/formatters';

export default function ExplanationPanel({ contributions = [], mainFactors = [] }) {
  // Use contributions if available, fallback to mainFactors
  const factors = (contributions.length > 0 ? contributions : mainFactors).slice(0, 6);

  // Fallback demo factors if empty
  const factorList = factors.length > 0 ? factors : [
    { feature: 'Weather_Condition', contribution: 0.22, direction: 'increases_risk' },
    { feature: 'Geopolitical_Risk_Score', contribution: 0.15, direction: 'increases_risk' },
    { feature: 'Lead_Time_Days', contribution: 0.08, direction: 'increases_risk' },
    { feature: 'Carrier_Reliability_Score', contribution: -0.12, direction: 'decreases_risk' },
  ];

  return (
    <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            Model Attribution (SHAP Vector Factors)
          </h3>
          <p className="text-xs text-slate-400">Feature contribution relative to baseline risk mean</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
          XGBoost SHAP
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {factorList.map((factor, idx) => {
          const score = typeof factor.contribution === 'number' ? factor.contribution : 0;
          const isIncreasing = score > 0 || factor.direction === 'increases_risk';
          const absVal = Math.min(100, Math.round(Math.abs(score) * 100));
          const formattedVal = (score > 0 ? '+' : '') + (score * 100).toFixed(1) + '%';
          const title = humanizeFeatureName(factor.feature);

          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  {isIncreasing ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {title}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isIncreasing ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formattedVal}
                </span>
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isIncreasing
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.max(8, absVal)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{factor.feature}</span>
                <span>{isIncreasing ? 'Risk Incrementor' : 'Risk Mitigator'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
