import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Cpu, Server, Sliders, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Settings() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const testBackend = async () => {
    setTestingConnection(true);
    const res = await checkHealth();
    setHealthStatus(res);
    setTestingConnection(false);
  };

  useEffect(() => {
    testBackend();
  }, []);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Telemetry"
        subtitle="RouteShield platform configuration, ML model status, and API connection diagnostics."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Configuration & Live Connection */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Backend Connection & Diagnostics</h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">API Base Endpoint URL</label>
              <input
                type="text"
                readOnly
                value={apiBaseUrl}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Configured via VITE_API_BASE_URL</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Flask Server Ping Status</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {healthStatus?.success ? 'HTTP 200 OK — Ready to receive requests' : 'Disconnected'}
                </div>
              </div>

              <button
                onClick={testBackend}
                disabled={testingConnection}
                className="px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>
            </div>
          </div>
        </div>

        {/* ML Model Specifications */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Machine Learning Telemetry</h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Model Architecture:</span>
              <span className="text-white font-semibold">XGBoost Classifier v1.2</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Feature Preprocessor:</span>
              <span className="text-white font-semibold">Scikit-Learn Standard Pipeline</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Explainability Engine:</span>
              <span className="text-cyan-400 font-semibold">SHAP (SHapley Additive exPlanations)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Required Input Schema:</span>
              <span className="text-emerald-400 font-semibold">14 Raw Features Validated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Theme & Interface Preferences */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">Application Theme & Interface</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/40 space-y-2">
            <div className="font-bold text-cyan-300 flex items-center justify-between">
              <span>Dark Command Center</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-slate-400 text-[11px]">
              High contrast slate-950 theme with cyan & emerald telemetry accents tailored for logistics operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
