import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area offset by sidebar width on desktop */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400 font-mono">
          RouteShield AI Logistics Disruption Prediction & Rerouting System &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
