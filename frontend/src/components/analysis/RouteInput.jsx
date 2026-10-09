import React, { useState } from 'react';
import { 
  Navigation, 
  Package, 
  ShieldAlert, 
  Calendar, 
  Play, 
  Sparkles, 
  MapPin,
  Check,
  Map,
  ArrowRight
} from 'lucide-react';
import { calculateRouteApi } from '../../services/routeApi';

const INITIAL_FORM = {
  Origin_Port: '',
  Destination_Port: '',
  Transport_Mode: 'Road',
  Product_Category: 'Electronics',
  Distance_km: 0,
  Weight_MT: 100.0,
  Fuel_Price_Index: 1.0,
  Geopolitical_Risk_Score: 0.2,
  Weather_Condition: 'Clear',
  Carrier_Reliability_Score: 0.8,
  Lead_Time_Days: 14,
  Year: new Date().getFullYear(),
  Month: new Date().getMonth() + 1,
  Day_of_Week: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
};

export default function RouteInput({ onSubmit, loading }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcStatus, setCalcStatus] = useState('');
  const [routeError, setRouteError] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === 'Origin_Port' || field === 'Destination_Port') {
      setRouteCalculated(false);
      setRouteResult(null);
    }
  };

  const handleCalculateRoute = async () => {
    if (!formData.Origin_Port.trim()) {
      setRouteError("Please enter an origin.");
      return;
    }
    if (!formData.Destination_Port.trim()) {
      setRouteError("Please enter a destination.");
      return;
    }
    if (formData.Origin_Port.trim().toLowerCase() === formData.Destination_Port.trim().toLowerCase()) {
      setRouteError("Origin and destination must be different.");
      return;
    }

    setRouteError(null);
    setCalculating(true);
    setRouteCalculated(false);
    
    try {
      setCalcStatus('Resolving origin...');
      await new Promise(resolve => setTimeout(resolve, 600));
      setCalcStatus('Resolving destination...');
      await new Promise(resolve => setTimeout(resolve, 600));
      setCalcStatus('Calculating route...');
      await new Promise(resolve => setTimeout(resolve, 600));
      setCalcStatus('Calculating distance...');

      const rawResult = await calculateRouteApi(formData.Origin_Port, formData.Destination_Port);
      const result = rawResult.data || rawResult;
      
      setFormData(prev => ({
        ...prev,
        Distance_km: result.distance_km,
        route_geometry: result.route_geometry,
        route_origin_data: result.origin,
        route_destination_data: result.destination,
        route_duration: result.duration_minutes
      }));
      setRouteResult(result);
      setRouteCalculated(true);
      setCalcStatus('');
    } catch (err) {
      if (err.isNetworkError) {
         setRouteError("RouteShield routing service is currently unavailable.");
      } else {
         setRouteError(err.message || "Unable to calculate this route right now.");
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (routeCalculated) {
      onSubmit(formData, routeResult);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* ROUTE CALCULATION SECTION */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-cyan-500/50 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Map className="w-24 h-24 text-cyan-400" />
        </div>
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 relative z-10">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">ANALYZE LOGISTICS ROUTE</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Origin Location</label>
            <input
              type="text"
              placeholder="Enter origin location........................"
              value={formData.Origin_Port}
              onChange={(e) => handleChange('Origin_Port', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Destination Location</label>
            <input
              type="text"
              placeholder="Enter destination location..................."
              value={formData.Destination_Port}
              onChange={(e) => handleChange('Destination_Port', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none placeholder-slate-600"
            />
          </div>
        </div>

        {routeError && (
          <div className="text-rose-400 text-xs font-medium bg-rose-500/10 p-2 rounded border border-rose-500/20 relative z-10">
            {routeError}
          </div>
        )}

        {!routeCalculated && (
          <div className="flex items-center space-x-4 pt-2 relative z-10">
            <button
              type="button"
              onClick={handleCalculateRoute}
              disabled={calculating}
              className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-sm font-semibold transition border border-cyan-500/30 flex items-center gap-2"
            >
              {calculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>{calcStatus}</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>Calculate Route</span>
                </>
              )}
            </button>
          </div>
        )}

        {routeCalculated && routeResult && (
          <div className="pt-4 mt-2 border-t border-slate-800 relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-4">
              <Check className="w-4 h-4" />
              <span>ROUTE FOUND</span>
            </div>
            
            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-center bg-slate-900 py-2 rounded border border-slate-800 text-white font-medium text-sm truncate px-2">
                  {routeResult.origin.name.split(',')[0]}
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <div className="flex-1 text-center bg-slate-900 py-2 rounded border border-slate-800 text-white font-medium text-sm truncate px-2">
                  {routeResult.destination.name.split(',')[0]}
                </div>
              </div>
              
              <div className="flex items-center gap-6 md:border-l md:border-slate-800 md:pl-6">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Calculated Distance</div>
                  <div className="text-lg font-mono text-cyan-400 font-bold flex items-center gap-1">
                    {routeResult.distance_km.toLocaleString()} km
                    <Check className="w-3 h-3 text-emerald-400 ml-1" title="Automatically calculated" />
                  </div>
                </div>
                {routeResult.duration_minutes && (
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Duration</div>
                    <div className="text-lg font-mono text-white font-bold">
                      ~{Math.floor(routeResult.duration_minutes / 60)}h {Math.round(routeResult.duration_minutes % 60)}m
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {routeCalculated && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* SECTION 2 — SHIPMENT SPECIFICATIONS */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Package className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">Section 2 — Cargo & Shipment Profile</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Transport Mode</label>
                <select
                  value={formData.Transport_Mode}
                  onChange={(e) => handleChange('Transport_Mode', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Road">Over-The-Road Logistics</option>
                  <option value="Maritime">Maritime Ocean Freight</option>
                  <option value="Air">Air Express Freight</option>
                  <option value="Rail">Intermodal Rail</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Product Category</label>
                <select
                  value={formData.Product_Category}
                  onChange={(e) => handleChange('Product_Category', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Semiconductors">Semiconductors & Chips</option>
                  <option value="Electronics">Consumer Electronics</option>
                  <option value="Automotive Parts">Automotive Components</option>
                  <option value="Pharmaceuticals">Pharmaceuticals & Cold Chain</option>
                  <option value="Perishables">Fresh Foods & Perishables</option>
                  <option value="Industrial Equipment">Heavy Machinery & Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cargo Weight (Metric Tons)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.Weight_MT}
                  onChange={(e) => handleChange('Weight_MT', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Lead Time (Days)</label>
                <input
                  type="number"
                  value={formData.Lead_Time_Days}
                  onChange={(e) => handleChange('Lead_Time_Days', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 — RISK SIGNALS */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Section 3 — Risk & Environmental Telemetry</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fuel Price Index Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Fuel Price Index</label>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{formData.Fuel_Price_Index}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={formData.Fuel_Price_Index}
                  onChange={(e) => handleChange('Fuel_Price_Index', parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Baseline = 1.0</span>
              </div>

              {/* Geopolitical Risk Score Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Geopolitical Risk Score</label>
                  <span className={`text-xs font-mono font-bold ${formData.Geopolitical_Risk_Score > 0.6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formData.Geopolitical_Risk_Score}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={formData.Geopolitical_Risk_Score}
                  onChange={(e) => handleChange('Geopolitical_Risk_Score', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">0.0 (Safe) to 1.0 (Critical)</span>
              </div>

              {/* Weather Condition Select */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Weather Condition</label>
                <select
                  value={formData.Weather_Condition}
                  onChange={(e) => handleChange('Weather_Condition', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Clear">Clear / Calm Seas</option>
                  <option value="Moderate">Moderate Wind / Swell</option>
                  <option value="Stormy">Stormy / High Swell</option>
                  <option value="Typhoon">Typhoon / Gale Warning</option>
                  <option value="Blizzard">Heavy Ice / Blizzard</option>
                </select>
              </div>

              {/* Carrier Reliability Score Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Carrier Reliability Score</label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{formData.Carrier_Reliability_Score}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={formData.Carrier_Reliability_Score}
                  onChange={(e) => handleChange('Carrier_Reliability_Score', parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">0.0 (Unreliable) to 1.0 (Top Tier)</span>
              </div>
            </div>
          </div>

          {/* SECTION 4 — TEMPORAL FIELDS */}
          <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">Section 4 — Temporal Parameters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.Year}
                  onChange={(e) => handleChange('Year', parseInt(e.target.value) || 2026)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Month</label>
                <select
                  value={formData.Month}
                  onChange={(e) => handleChange('Month', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>Month {m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Day of Week (0=Monday, 6=Sunday)</label>
                <select
                  value={formData.Day_of_Week}
                  onChange={(e) => handleChange('Day_of_Week', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
                >
                  <option value={0}>0 — Monday</option>
                  <option value={1}>1 — Tuesday</option>
                  <option value={2}>2 — Wednesday</option>
                  <option value={3}>3 — Thursday</option>
                  <option value={4}>4 — Friday</option>
                  <option value={5}>5 — Saturday</option>
                  <option value={6}>6 — Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg glow-cyan flex items-center space-x-2 transition"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Continue to Risk Analysis</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
