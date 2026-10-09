import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, Trash2, ArrowRight, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { getAnalysisHistory, clearAnalysisHistory } from '../utils/storage';
import { formatDate } from '../utils/formatters';
import { formatPercent } from '../utils/riskUtils';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  useEffect(() => {
    setHistory(getAnalysisHistory());
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear analysis history?')) {
      clearAnalysisHistory();
      setHistory([]);
    }
  };

  const handleRowClick = (item) => {
    navigate('/results', {
      state: {
        resultData: item.apiResult,
        inputData: item.inputData,
      },
    });
  };

  // Filter logic
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.origin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.mode || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;
    const matchesDecision = decisionFilter === 'ALL' || item.decision === decisionFilter;

    return matchesSearch && matchesRisk && matchesDecision;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        subtitle="Review past disruption evaluations, risk trends, and dispatch recommendations."
        action={
          history.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )
        }
      />

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search port, corridor, commodity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filters:</span>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="ALL">All AI Decisions</option>
            <option value="REROUTE">Reroute Recommended</option>
            <option value="STAY">Stay on Route</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No Matching Analyses Found"
          message="Try clearing search keywords or updating your filter options."
        />
      ) : (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Date / Timestamp</th>
                <th className="py-3 px-3">Corridor (Origin → Destination)</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Commodity</th>
                <th className="py-3 px-3 text-center">Disruption Risk</th>
                <th className="py-3 px-3 text-center">AI Decision</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-slate-800/50 cursor-pointer transition"
                >
                  <td className="py-3.5 px-3 text-slate-400">
                    {formatDate(item.timestamp)}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-100">
                    {item.origin} → {item.destination}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{item.mode}</td>
                  <td className="py-3.5 px-3 text-slate-400">{item.product || 'General'}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-slate-100">
                      {formatPercent(item.riskScore)}
                    </span>
                    <div className="mt-0.5">
                      <StatusBadge status={item.riskLevel} type="risk" />
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={item.decision} type="decision" />
                  </td>
                  <td className="py-3.5 px-3 text-right text-cyan-400">
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
