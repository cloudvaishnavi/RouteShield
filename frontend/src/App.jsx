import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import AnalyzeRoute from './pages/AnalyzeRoute';
import Results from './pages/Results';
import History from './pages/History';
import Settings from './pages/Settings';
import SavedRoutes from './pages/SavedRoutes';
import OfflineRouteView from './pages/OfflineRouteView';
import DriverSafety from './pages/DriverSafety';

export default function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<AnalyzeRoute />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/saved-routes" element={<SavedRoutes />} />
          <Route path="/safety" element={<DriverSafety />} />
          <Route path="/offline-routes/:id" element={<OfflineRouteView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </Router>
  );
}
