import React, { useState } from 'react';
import { Bot, CheckCircle2, ChevronDown, ChevronUp, Cpu, Activity, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function AgentActivity({ agentData }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const steps = agentData?.steps || [
    {
      agent: 'Disruption Agent',
      status: 'completed',
      message: 'Evaluated weather front, SHAP features, and oceanographic telemetry.',
    },
    {
      agent: 'Route Agent',
      status: 'completed',
      message: 'Computed 2 alternative bypass corridors with dynamic distance & ETA constraints.',
    },
    {
      agent: 'Decision Agent',
      status: 'completed',
      message: 'Arbitrated risk-to-delay ratio and finalized dispatch recommendation.',
    },
  ];

  return (
    <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left focus:outline-none"
      >
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-semibold text-white">Agent Orchestration Pipeline</h3>
            <p className="text-xs text-slate-400">Execution traces from the multi-agent reasoning engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <span>{steps.length} Agents Executed</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0 mt-0.5">
                  0{idx + 1}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    {step.agent}
                    <StatusBadge status={step.status} type="agent" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{step.message}</p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1 shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Latency: ~120ms</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
