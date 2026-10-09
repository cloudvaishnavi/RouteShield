import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { ArrowRight, FileText, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { formatPercent } from '../../utils/riskUtils';

export default function RecentAnalyses({ history = [] }) {
  const navigate = useNavigate();

  const handleRowClick = (item) => {
    navigate('/results', { state: { resultData: item.apiResult, inputData: item.inputData } });
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Recent Disruption Analyses
          </h3>
          <p className="text-xs text-slate-400">Latest multi-agent route evaluations</p>
        </div>
        <Link
          to="/history"
          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-medium text-sm">
            No recent analyses.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Route Corridor</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-center">Disruption Risk</th>
                <th className="py-2.5 px-3 text-center">AI Decision</th>
                <th className="py-2.5 px-3 text-right">Analyzed At</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {history.slice(0, 5).map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    {item.origin} → {item.destination}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{item.mode}</td>
                  <td className="py-3 px-3 text-slate-400">{item.product || 'General'}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-slate-100">
                      {formatPercent(item.riskScore)}
                    </span>
                    <div className="mt-0.5">
                      <StatusBadge status={item.riskLevel} type="risk" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={item.decision} type="decision" />
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">
                    {formatDate(item.timestamp)}
                  </td>
                  <td className="py-3 px-3 text-right text-cyan-400">
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
