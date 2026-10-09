import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, ArrowRight, CornerDownRight, Check, Share2, Layers } from 'lucide-react';
import { formatPercent } from '../../utils/riskUtils';

export default function RecommendationCard({ recommendation, inputData }) {
  const [isDispatched, setIsDispatched] = useState(false);

  const action = recommendation?.action || 'STAY';
  const isReroute = action === 'REROUTE';
  const reason = recommendation?.reason || (isReroute 
    ? 'High weather and geopolitical disruption risk detected; alternative bypass route identified.'
    : 'Disruption probability remains within acceptable operating tolerance.');

  const riskReduction = recommendation?.risk_reduction || (isReroute ? 0.35 : 0.0);
  const recommendedRouteObj = recommendation?.recommended_route;

  const handleDispatch = () => {
    setIsDispatched(true);
    setTimeout(() => setIsDispatched(false), 4000);
  };

  return (
    <div className={`p-6 rounded-xl border transition-all ${
      isReroute
        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border-rose-500/40 glow-rose'
        : 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/40 glow-emerald'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            isReroute
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          }`}>
            {isReroute ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Autonomous AI Decision Agent
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
              isReroute ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {isReroute ? 'REROUTE RECOMMENDED' : 'STAY ON CURRENT ROUTE'}
            </h2>
          </div>
        </div>

        {riskReduction > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated Risk Delta</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              -{formatPercent(riskReduction)} Risk
            </div>
          </div>
        )}
      </div>

      {/* Rationale & Action Plan */}
      <div className="my-4 space-y-3">
        <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong className="text-white">Decision Rationale: </strong>
          {reason}
        </div>

        {recommendedRouteObj && typeof recommendedRouteObj === 'object' && (
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-start space-x-2 text-xs">
            <CornerDownRight className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-cyan-300">Target Trajectory: </span>
              <span className="text-slate-200 font-mono">
                {recommendedRouteObj.name || `${recommendedRouteObj.origin} → ${recommendedRouteObj.destination}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Dispatch & Confirm CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono text-slate-400">
          Status: <span className="text-white font-semibold">Decision Validated by Agent Arbitrator</span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleDispatch}
            disabled={isDispatched}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition ${
              isDispatched
                ? 'bg-emerald-500 text-slate-950'
                : isReroute
                ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 glow-rose'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-emerald'
            }`}
          >
            {isDispatched ? (
              <>
                <Check className="w-4 h-4" />
                <span>Voyage Protocol Dispatched!</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isReroute ? 'Confirm & Authorize Reroute' : 'Approve Current Route'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">External Maps</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(inputData?.Origin_Port || '')}&destination=${encodeURIComponent(inputData?.Destination_Port || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-sm text-cyan-400 font-medium flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Open Current Route in Google Maps</span>
          </a>

          {isReroute && recommendedRouteObj ? (
             <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(recommendedRouteObj.origin || inputData?.Origin_Port)}&destination=${encodeURIComponent(recommendedRouteObj.destination || inputData?.Destination_Port)}${recommendedRouteObj.via ? `&waypoints=${encodeURIComponent(recommendedRouteObj.via)}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-sm text-cyan-400 font-medium flex items-center justify-center gap-2 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Open Recommended Route</span>
            </a>
          ) : (
            <div className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
              <span>No alternative route generated.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
