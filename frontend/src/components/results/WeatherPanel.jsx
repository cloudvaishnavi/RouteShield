import React from 'react';
import { CloudRain, Wind, Thermometer, ShieldAlert, Sun, CloudLightning } from 'lucide-react';

export default function WeatherPanel({ inputData }) {
  const weatherCond = inputData?.Weather_Condition || 'Stormy';
  const geoRisk = inputData?.Geopolitical_Risk_Score ?? 0.45;

  const isSevere = weatherCond === 'Stormy' || weatherCond === 'Typhoon' || weatherCond === 'Blizzard';

  return (
    <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <CloudLightning className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Weather & Corridor Risk Enrichment</h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
          isSevere ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          {isSevere ? 'Severe Weather Alert' : 'Normal Conditions'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {isSevere ? <CloudRain className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Weather Condition</div>
            <div className="font-bold text-white mt-0.5">{weatherCond}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Geopolitical Risk Score</div>
            <div className="font-bold text-white mt-0.5">{geoRisk.toFixed(2)} / 1.0</div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Environmental Telemetry</div>
            <div className="font-bold text-emerald-400 mt-0.5">Enriched via NOAA</div>
          </div>
        </div>
      </div>
    </div>
  );
}
