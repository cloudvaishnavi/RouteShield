import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';

const trendData = [
  { time: '00:00', risk: 24, baseline: 30 },
  { time: '04:00', risk: 28, baseline: 30 },
  { time: '08:00', risk: 42, baseline: 30 },
  { time: '12:00', risk: 78, baseline: 30 },
  { time: '16:00', risk: 65, baseline: 30 },
  { time: '20:00', risk: 36, baseline: 30 },
  { time: '24:00', risk: 32, baseline: 30 },
];

export default function RiskOverview() {
  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            24-Hour Disruption Risk Trend
          </h3>
          <p className="text-xs text-slate-400">Composite ML disruption risk telemetry across maritime & air corridors</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span className="text-slate-300">Live Composite Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span className="text-slate-400">Safety Threshold (30%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0e1420',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              formatter={(val) => [`${val}%`, 'Risk Score']}
            />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#riskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
