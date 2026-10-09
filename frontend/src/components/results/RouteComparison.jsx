import React from 'react';
import { GitCompare, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDistance } from '../../utils/formatters';
import { formatPercent } from '../../utils/riskUtils';

export default function RouteComparison({ routeAnalysis, recommendation, inputData }) {
  const currentRoute = routeAnalysis?.current_route || {
    name: `${inputData?.Origin_Port || 'Port of Shanghai'} → ${inputData?.Destination_Port || 'Port of Los Angeles'} (Direct)`,
    origin: inputData?.Origin_Port || 'Port of Shanghai',
    destination: inputData?.Destination_Port || 'Port of Los Angeles',
    mode: inputData?.Transport_Mode || 'Maritime',
    distance_km: inputData?.Distance_km || 10450,
    eta_days: inputData?.Lead_Time_Days || 14,
    riskLevel: 'HIGH',
    riskScore: 0.785,
  };

  const alternatives = routeAnalysis?.alternative_routes || [];
  const altRoute = alternatives[0] || {
    name: `${inputData?.Origin_Port || 'Port of Shanghai'} → Staging Safety Hub → ${inputData?.Destination_Port || 'Port of Los Angeles'}`,
    origin: inputData?.Origin_Port || 'Port of Shanghai',
    via: 'Regional Safety Corridor',
    destination: inputData?.Destination_Port || 'Port of Los Angeles',
    mode: inputData?.Transport_Mode || 'Maritime',
    distance_km: Math.round((inputData?.Distance_km || 10450) * 1.06),
    eta_days: Math.round((inputData?.Lead_Time_Days || 14) * 1.1),
    riskLevel: 'LOW',
    riskScore: 0.285,
    risk_mitigation: 'Bypasses northern storm cell & geopolitical choke points',
  };

  const isRerouteRecommended = recommendation?.action === 'REROUTE';

  return (
    <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            Route Trajectory Comparison Matrix
          </h3>
          <p className="text-xs text-slate-400">Evaluating current planned lane against alternative bypass options</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
          {alternatives.length + 1} Paths Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CURRENT ROUTE CARD */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
          !isRerouteRecommended
            ? 'bg-emerald-500/10 border-emerald-500/50 glow-emerald'
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                Primary Plan (Current)
              </span>
              {!isRerouteRecommended && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RECOMMENDED
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-white mt-1">{currentRoute.name || 'Direct Route'}</h4>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Trajectory Distance:</span>
              <span className="text-white font-semibold">{formatDistance(currentRoute.distance_km)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Estimated Transit ETA:</span>
              <span className="text-white font-semibold">{currentRoute.eta_days || 14} Days</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Transport Mode:</span>
              <span className="text-cyan-400 font-semibold">{currentRoute.mode || 'Maritime'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Disruption Risk Tier:</span>
              <StatusBadge status={isRerouteRecommended ? 'HIGH' : 'LOW'} type="risk" />
            </div>
          </div>
        </div>

        {/* ALTERNATIVE BYPASS ROUTE CARD */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
          isRerouteRecommended
            ? 'bg-emerald-500/10 border-emerald-500/50 glow-emerald'
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                Alternative Bypass Option
              </span>
              {isRerouteRecommended && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RECOMMENDED
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-white mt-1">{altRoute.name || 'Bypass Route'}</h4>
            {altRoute.risk_mitigation && (
              <p className="text-[11px] text-cyan-300 mt-1 italic">
                "{altRoute.risk_mitigation}"
              </p>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Trajectory Distance:</span>
              <span className="text-white font-semibold">{formatDistance(altRoute.distance_km)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Estimated Transit ETA:</span>
              <span className="text-white font-semibold">{altRoute.eta_days || 16} Days</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Transport Mode:</span>
              <span className="text-cyan-400 font-semibold">{altRoute.mode || 'Maritime'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Disruption Risk Tier:</span>
              <StatusBadge status="LOW" type="risk" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
