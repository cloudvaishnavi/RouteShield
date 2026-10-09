import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert, Cpu, Activity, RefreshCw, Bell, Search, PlusCircle } from 'lucide-react';
import { checkHealth } from '../../services/api';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const location = useLocation();
  const [systemStatus, setSystemStatus] = useState('checking'); // checking, healthy, offline

  const verifySystem = async () => {
    setSystemStatus('checking');
    const res = await checkHealth();
    if (res.success) {
      setSystemStatus('healthy');
    } else {
      setSystemStatus('offline');
    }
  };

  useEffect(() => {
    verifySystem();
    const timer = setInterval(verifySystem, 45000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle Navigation Menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Brand Title */}
        <Link to="/" className="lg:hidden flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">RouteShield</span>
        </Link>

        {/* Page Context Badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium uppercase tracking-wider">AI Logistics Command</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">v2.4 Production</span>
        </div>
      </div>

      {/* Right Topbar Controls */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        {/* System Health Status Indicator */}
        <button
          onClick={verifySystem}
          title="Click to re-check backend status"
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
            systemStatus === 'healthy'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : systemStatus === 'checking'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
            systemStatus === 'healthy' ? 'bg-emerald-400 animate-pulse' :
            systemStatus === 'checking' ? 'bg-amber-400 animate-spin' : 'bg-rose-500'
          }`}></span>
          <span className="hidden sm:inline font-mono">
            {systemStatus === 'healthy' ? 'ML Engine Online' :
             systemStatus === 'checking' ? 'Connecting...' : 'Backend Offline'}
          </span>
          <RefreshCw className={`w-3 h-3 text-slate-400 ${systemStatus === 'checking' ? 'animate-spin' : ''}`} />
        </button>

        {/* Quick Analyze Button */}
        {location.pathname !== '/analyze' && (
          <Link
            to="/analyze"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Analysis</span>
          </Link>
        )}

        {/* User Badge */}
        <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
            OP
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-slate-200">Logistics Officer</div>
            <div className="text-[10px] text-slate-400 font-mono">Global Command</div>
          </div>
        </div>
      </div>
    </header>
  );
}
