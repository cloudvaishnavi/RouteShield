import React from 'react';
import MetricCard from '../common/MetricCard';
import { Route, AlertTriangle, ShieldAlert, GitPullRequest, Activity } from 'lucide-react';

export default function KPIGrid({ history = [] }) {
  // Calculate dynamic statistics based on history
  const totalRoutes = history.length;
  const highRiskCount = history.filter(h => h.riskLevel === 'HIGH' || h.riskLevel === 'CRITICAL').length;
  const mediumRiskCount = history.filter(h => h.riskLevel === 'MEDIUM').length;
  const reroutedCount = history.filter(h => h.decision === 'REROUTE').length;
  
  const avgRisk = history.length > 0 
    ? (history.reduce((acc, curr) => acc + (curr.riskScore || 0), 0) / history.length) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Active Corridors"
        value={totalRoutes}
        subtitle="Global monitored lanes"
        icon={Route}
        color="cyan"
      />
      <MetricCard
        title="High Risk Lanes"
        value={highRiskCount}
        subtitle="Intervention needed"
        icon={AlertTriangle}
        color="rose"
        trend={{ value: '+1 today', isPositive: false }}
      />
      <MetricCard
        title="Moderate Risk"
        value={mediumRiskCount}
        subtitle="Close telemetry monitoring"
        icon={ShieldAlert}
        color="amber"
      />
      <MetricCard
        title="Routes Rerouted"
        value={reroutedCount}
        subtitle="Proactive mitigation"
        icon={GitPullRequest}
        color="emerald"
        trend={{ value: '88% saved', isPositive: true }}
      />
      <MetricCard
        title="Avg Fleet Risk"
        value={`${avgRisk.toFixed(1)}%`}
        subtitle="XGBoost Composite Score"
        icon={Activity}
        color="cyan"
      />
    </div>
  );
}
