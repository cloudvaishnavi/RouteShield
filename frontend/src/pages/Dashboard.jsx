import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import KPIGrid from '../components/dashboard/KPIGrid';
import RiskOverview from '../components/dashboard/RiskOverview';
import AlertsList from '../components/dashboard/AlertsList';
import RecentAnalyses from '../components/dashboard/RecentAnalyses';
import SystemStatus from '../components/dashboard/SystemStatus';
import { PlusCircle, Play } from 'lucide-react';
import { getAnalysisHistory } from '../utils/storage';

export default function Dashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getAnalysisHistory());
  }, []);

  return (
    <div className="space-y-6">
      {/* Dashboard Page Header */}
      <PageHeader
        title="Logistics Intelligence"
        subtitle="Monitor disruption risk across global corridors and execute proactive routing decisions."
        action={
          <Link
            to="/analyze"
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md glow-cyan flex items-center space-x-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyze New Route</span>
          </Link>
        }
      />

      {/* KPI Stats Grid */}
      <KPIGrid history={history} />

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <RiskOverview />
          <RecentAnalyses history={history} />
        </div>

        {/* Right Column (1/3 width on desktop) */}
        <div className="space-y-6">
          <AlertsList />
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}
