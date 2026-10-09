import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { getOfflineRoutes, deleteOfflineRoute, clearOfflineRoutes } from '../services/offlineRouteStore';
import { Trash2, Map, Navigation, ShieldAlert, WifiOff, Trash } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function SavedRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useNetworkStatus();
  const navigate = useNavigate();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const saved = await getOfflineRoutes();
      setRoutes(saved || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteOfflineRoute(id);
      await loadRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL offline routes?")) {
      try {
        await clearOfflineRoutes();
        await loadRoutes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Offline Routes"
        subtitle="Access your critical route intelligence without internet connectivity"
        action={
          routes.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  if (window.confirm('Delete all cached map tiles?')) {
                    const { clearTileCache } = await import('../utils/tileDownloader');
                    await clearTileCache();
                    window.alert('Map tiles cleared.');
                  }
                }}
                className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold flex items-center space-x-1.5 transition border border-amber-500/30"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Clear Map Cache</span>
              </button>
              <button
                onClick={handleClearAll}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center space-x-1.5 transition border border-rose-500/30"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Clear Corrupt/All</span>
              </button>
            </div>
          )
        }
      />

      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3 text-amber-400">
          <WifiOff className="w-5 h-5" />
          <div>
            <h4 className="font-bold text-sm">OFFLINE MODE</h4>
            <p className="text-xs opacity-80">Internet connection unavailable. Showing cached RouteShield data.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm">Loading routes...</div>
      ) : routes.length === 0 ? (
        <div className="text-slate-400 text-sm bg-slate-900/50 p-8 rounded-xl border border-slate-800 text-center">
          {isOnline ? "No offline routes saved yet. Analyze a route and save it to view here." : "No offline route is available on this device."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map(route => (
            <div 
              key={route.route_id}
              onClick={() => navigate(`/offline-routes/${route.route_id}`)}
              className="bg-slate-900/80 border border-slate-700/50 hover:border-cyan-500/50 p-5 rounded-xl cursor-pointer transition flex flex-col group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="text-xs text-slate-400 font-medium truncate">{route.origin?.name?.split(',')[0]}</div>
                  <div className="text-slate-500 text-[10px] my-1">↓</div>
                  <div className="text-sm text-white font-bold truncate">{route.destination?.name?.split(',')[0]}</div>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, route.route_id)}
                  className="p-1.5 rounded bg-slate-800/50 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                  title="Delete offline route"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  {route.distance_km} km
                </div>
                <div className="flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5 text-emerald-400" />
                  ~{Math.floor((route.duration_minutes || 0) / 60)}h
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldAlert className={`w-3.5 h-3.5 ${route.risk?.level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`} />
                  <span className="text-slate-300">Risk: <span className="font-bold text-white">{route.risk?.level}</span></span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {['fuel_stations', 'restaurants', 'washrooms', 'charging_stations'].map(poi => {
                    const count = route.pois?.[poi]?.length || 0;
                    return count > 0 ? (
                      <span key={poi} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {count} {poi.split('_')[0]}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
