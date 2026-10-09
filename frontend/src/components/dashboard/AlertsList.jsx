import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const activeAlerts = [
  {
    id: 'alt-1',
    route: 'Port of Shanghai → Port of Los Angeles',
    mode: 'Maritime',
    riskLevel: 'HIGH',
    riskScore: '78.5%',
    reason: 'Severe Typhoon Swell Warning in Transpacific Passage',
    recommendation: 'REROUTE RECOMMENDED',
    time: '12m ago',
  },
  {
    id: 'alt-2',
    route: 'Port of Rotterdam → Port of Singapore',
    mode: 'Maritime',
    riskLevel: 'MEDIUM',
    riskScore: '54.2%',
    reason: 'Suez Canal Staging Delay & High Fuel Surcharge Index',
    recommendation: 'MONITOR CLOSELY',
    time: '1h ago',
  },
];

export default function AlertsList() {
  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Active Disruption Alerts
        </h3>
        <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
          2 Urgent Signals
        </span>
      </div>

      <div className="space-y-3">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border transition-all ${
              alert.riskLevel === 'HIGH'
                ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
                : 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    alert.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {alert.riskLevel} RISK ({alert.riskScore})
                  </span>
                  <span className="text-xs font-mono text-slate-400">{alert.mode}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">{alert.route}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{alert.reason}</p>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
                  {alert.recommendation}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{alert.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
