import React from 'react';
import { Anchor, Navigation, Calendar, Package, MapPin } from 'lucide-react';
import { formatDistance, formatDate } from '../../utils/formatters';

export default function DisruptionCard({ inputData, resultData }) {
  const origin = inputData?.Origin_Port || 'Port of Shanghai';
  const destination = inputData?.Destination_Port || 'Port of Los Angeles';
  const mode = inputData?.Transport_Mode || 'Maritime';
  const product = inputData?.Product_Category || 'Electronics';
  const distance = inputData?.Distance_km || 10450;
  const leadTime = inputData?.Lead_Time_Days || 14;

  return (
    <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Anchor className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Corridor & Shipment Metadata</h3>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/30">
          {mode} Mode
        </span>
      </div>

      {/* Origin -> Destination Banner */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Origin Corridor</div>
            <div className="text-sm font-bold text-white">{origin}</div>
          </div>
        </div>

        <div className="hidden sm:block text-slate-600 font-mono text-xs">
          ────────►
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Destination Target</div>
            <div className="text-sm font-bold text-white">{destination}</div>
          </div>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
          <div className="text-slate-400">Product Category</div>
          <div className="font-semibold text-slate-200 mt-0.5 truncate">{product}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
          <div className="text-slate-400">Distance</div>
          <div className="font-semibold text-slate-200 mt-0.5">{formatDistance(distance)}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
          <div className="text-slate-400">Lead Time</div>
          <div className="font-semibold text-slate-200 mt-0.5">{leadTime} Days</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
          <div className="text-slate-400">Timestamp</div>
          <div className="font-semibold text-slate-200 mt-0.5">{formatDate()}</div>
        </div>
      </div>
    </div>
  );
}
