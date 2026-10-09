import React, { useState, useEffect } from 'react';
import { Cpu, CloudLightning, Route, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkHealth } from '../../services/api';

export default function SystemStatus() {
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    checkHealth().then(setBackendHealth);
  }, []);

  const isOnline = backendHealth?.success;

  const services = [
    {
      name: 'ML Disruption Model',
      detail: 'XGBoost Classifier v1.2',
      status: isOnline ? 'healthy' : 'degraded',
      icon: Cpu,
    },
    {
      name: 'Weather Enrichment Service',
      detail: 'NOAA & Maritime Swell Telemetry',
      status: 'healthy',
      icon: CloudLightning,
    },
    {
      name: 'Routing & Detour Engine',
      detail: 'Geodesic Waypoint Solver',
      status: 'healthy',
      icon: Route,
    },
    {
      name: 'Multi-Agent Orchestrator',
      detail: 'Disruption → Route → Decision Pipeline',
      status: 'healthy',
      icon: Bot,
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          System Health Telemetry
        </h3>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
          isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {isOnline ? 'All Systems Operational' : 'Offline / Standby Mode'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-slate-800 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{srv.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{srv.detail}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                {srv.status === 'healthy' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-emerald-400 font-medium">Healthy</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-amber-400 font-medium">Degraded</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
