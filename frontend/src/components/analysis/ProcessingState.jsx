import React from 'react';
import { Cpu, CheckCircle2, Loader2, Circle, ShieldAlert, Route, Bot } from 'lucide-react';

const AGENT_STEPS = [
  { id: 'validating', name: '01. Input Telemetry Validation', agent: 'System', desc: 'Validating 14 raw shipment and environmental features' },
  { id: 'agent_disruption', name: '02. Disruption Agent Evaluation', agent: 'Disruption Agent', desc: 'Running XGBoost model & calculating SHAP factor contributions' },
  { id: 'agent_route', name: '03. Route Agent Trajectory Analysis', agent: 'Route Agent', desc: 'Evaluating geodesic bypass paths & weather choke points' },
  { id: 'agent_decision', name: '04. Decision Agent Arbitration', agent: 'Decision Agent', desc: 'Arbitrating risk vs. delay trade-offs to determine final action' },
  { id: 'completed', name: '05. Recommendation Synthesis', agent: 'System', desc: 'Generating actionable dispatch report & risk reduction matrix' },
];

export default function ProcessingState({ currentStep }) {
  const getStepIndex = (stepId) => {
    switch (stepId) {
      case 'validating': return 0;
      case 'agent_disruption': return 1;
      case 'agent_route': return 2;
      case 'agent_decision': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="p-8 sm:p-12 rounded-xl bg-slate-900/90 border border-slate-800 space-y-8 max-w-3xl mx-auto shadow-2xl">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Multi-Agent Workflow Pipeline Active</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Analyzing Route Telemetry...</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          RouteShield AI agents are performing real-time disruption prediction and route trajectory optimization.
        </p>
      </div>

      {/* Progress Timeline List */}
      <div className="space-y-4">
        {AGENT_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex || currentStep === 'completed';
          const isCurrent = idx === currentIndex && currentStep !== 'completed';
          const isPending = idx > currentIndex && currentStep !== 'completed';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-200'
                  : isCurrent
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-lg glow-cyan'
                  : 'bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isCurrent && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />}
                  {isPending && <Circle className="w-5 h-5 text-slate-600 shrink-0" />}

                  <div>
                    <div className="text-xs font-mono font-bold flex items-center gap-2">
                      <span>{step.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                        {step.agent}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>

                <div className="font-mono text-xs text-right shrink-0 ml-2">
                  {isDone && <span className="text-emerald-400 font-bold uppercase">Completed</span>}
                  {isCurrent && <span className="text-cyan-400 font-bold uppercase animate-pulse">Running</span>}
                  {isPending && <span className="text-slate-400 uppercase">Pending</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
