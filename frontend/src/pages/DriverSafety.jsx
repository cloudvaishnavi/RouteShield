import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { updateLocation, confirmSafety, getSafetyStatus, configureZone } from '../services/safetyApi';
import { ShieldAlert, ShieldCheck, MapPin, Navigation, Clock, AlertTriangle, CheckCircle, WifiOff, Settings2, Zap, PowerOff, Flag } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function DriverSafety() {
  const [status, setStatus] = useState('Checking...');
  const [incident, setIncident] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [zonesConfigured, setZonesConfigured] = useState(true);
  const isOnline = useNetworkStatus();

  // Demo Mode States
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [accelerated, setAccelerated] = useState(false);
  const [demoLat, setDemoLat] = useState(null);
  const [demoLng, setDemoLng] = useState(null);
  const [simulateGpsLoss, setSimulateGpsLoss] = useState(false);

  const DEMO_RISK_LAT = 12.9716;
  const DEMO_RISK_LNG = 77.5946;
  const DEMO_SAFE_LAT = 13.05; // Outside 5km radius
  const DEMO_SAFE_LNG = 77.65;

  // Setup initial mock zone if none exist (for demonstration purposes since it's a new feature)
  useEffect(() => {
    const setupDemoZone = async () => {
      try {
        await configureZone({
          name: 'Demo High-Risk Area',
          latitude: DEMO_RISK_LAT,
          longitude: DEMO_RISK_LNG,
          radius_meters: 5000,
          risk_level: 'HIGH'
        });
      } catch (err) {
        console.warn('Failed to setup demo zone', err);
      }
    };
    setupDemoZone();
  }, []);

  const callUpdateLocation = async (lat, lng) => {
    try {
      const res = await updateLocation(lat, lng, { isDemo: isDemoMode, accelerated });
      if (res.success) {
        setIncident(res.incident || null);
        if (!res.zones_active) {
          setStatus('No Zones Configured');
          setZonesConfigured(false);
        } else {
          setStatus(res.incident ? 'High-Risk Zone Detected' : 'Safe Zone');
          setZonesConfigured(true);
        }
      } else {
        setGpsError(`Update failed: ${res.error?.message || 'Unknown error'}`);
        setStatus('Update Failed');
      }
    } catch (err) {
      console.error('Error updating location:', err);
      setGpsError(err.message || 'Network error while updating location.');
      setStatus('Network Error');
    }
  };

  useEffect(() => {
    let watchId;
    let demoInterval;
    
    if (isDemoMode) {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setStatus('Demo Mode Active - Waiting for action');
      
      // We only update periodically if we have a demo location set
      if (demoLat !== null && demoLng !== null && !simulateGpsLoss) {
        callUpdateLocation(demoLat, demoLng);
        demoInterval = setInterval(() => {
          if (simulateGpsLoss) {
             setStatus('GPS Signal Lost (Simulated)');
             setGpsError('Simulated GPS signal loss.');
          } else {
             callUpdateLocation(demoLat, demoLng);
          }
        }, 5000);
      } else if (simulateGpsLoss) {
         setStatus('GPS Signal Lost (Simulated)');
         setGpsError('Simulated GPS signal loss.');
      } else {
         setGpsError('');
      }
      
    } else {
      const trackLocation = () => {
        if (!navigator.geolocation) {
          setGpsError('Geolocation is not supported by your browser.');
          return;
        }
        
        setStatus('Waiting for GPS...');
        
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            setGpsError('');
            setStatus('GPS Active - Tracking');
            await callUpdateLocation(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.error(err);
            setGpsError('GPS permission denied or unavailable. Please enable location services.');
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      };

      trackLocation();
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (demoInterval) clearInterval(demoInterval);
    };
  }, [isDemoMode, demoLat, demoLng, simulateGpsLoss, accelerated]);

  // Poll for status in case worker escalates it or we miss a network update
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getSafetyStatus();
        if (res.success && res.incident) {
          setIncident(res.incident);
        } else if (res.success && !res.incident) {
          setIncident(null);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (!incident || incident.status === 'RESOLVED') {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = new Date(incident.deadline + 'Z').getTime(); // Ensure UTC
      const diff = deadline - now;
      
      if (diff <= 0) {
        setTimeRemaining('00:00');
        if (incident.status === 'ACTIVE') {
           setTimeRemaining('EXPIRED - ESCALATING');
        }
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [incident]);

  const handleConfirmSafety = async () => {
    if (!incident) return;
    if (!isOnline) {
      alert('Cannot send safety confirmation while offline. Emergency services cannot be reached. Please find a network connection.');
      return;
    }
    setConfirming(true);
    try {
      const res = await confirmSafety(incident.incident_id);
      if (res.success) {
        setIncident(res.incident);
        alert('Safety confirmed successfully. Thank you.');
      } else {
        alert(res.error || 'Failed to confirm safety.');
      }
    } catch (err) {
      alert('Network error while confirming safety.');
    } finally {
      setConfirming(false);
    }
  };

  const startDemoSim = (lat, lng) => {
    setSimulateGpsLoss(false);
    setDemoLat(lat);
    setDemoLng(lng);
    callUpdateLocation(lat, lng);
  };

  const triggerGpsLoss = () => {
    setSimulateGpsLoss(true);
    setDemoLat(null);
    setDemoLng(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Safety Monitor"
        subtitle="Live GPS tracking and emergency escalation"
      />

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">Demo Mode — Simulated GPS</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isDemoMode} onChange={() => {
              setIsDemoMode(!isDemoMode);
              setDemoLat(null);
              setDemoLng(null);
              setSimulateGpsLoss(false);
              setGpsError('');
            }} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
          </label>
        </div>

        {isDemoMode && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
               <span className="text-sm text-slate-300 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400"/> Accelerated Test (60s timer)</span>
               <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={accelerated} onChange={() => setAccelerated(!accelerated)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <button onClick={() => startDemoSim(DEMO_RISK_LAT, DEMO_RISK_LNG)} className="flex flex-col items-center justify-center p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition">
                <MapPin className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold uppercase text-center">Simulate Entry<br/>(Risk Zone)</span>
              </button>
              <button onClick={() => startDemoSim(DEMO_SAFE_LAT, DEMO_SAFE_LNG)} className="flex flex-col items-center justify-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 transition">
                <Flag className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold uppercase text-center">Simulate Exit<br/>(Safe Zone)</span>
              </button>
              <button onClick={triggerGpsLoss} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 transition">
                <PowerOff className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold uppercase text-center">Simulate<br/>GPS Loss</span>
              </button>
            </div>
            {isDemoMode && (demoLat || demoLng) && !simulateGpsLoss && (
               <div className="text-xs text-indigo-300 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
                 [SIMULATED] Currently injecting coords: {demoLat}, {demoLng}
               </div>
            )}
          </div>
        )}
      </div>

      {gpsError && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">LOCATION ERROR</h4>
            <p className="text-xs opacity-80">{gpsError}</p>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3 text-amber-400">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">CONNECTION LOST</h4>
            <p className="text-xs opacity-80">
              Live emergency calls and SMS cannot be guaranteed while disconnected from the server. 
              The safety timer will continue counting down, but escalations require a connection.
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Navigation className={`w-5 h-5 ${gpsError ? 'text-slate-600' : 'text-cyan-400'} ${isDemoMode ? 'text-indigo-400' : ''}`} />
            <div>
              <h3 className="font-bold text-white text-sm">GPS Status {isDemoMode && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded ml-2">SIMULATED</span>}</h3>
              <p className="text-xs text-slate-400">{status}</p>
            </div>
          </div>
        </div>

        {!incident ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {status === 'Safe Zone' ? (
              <>
                <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4 opacity-80" />
                <h2 className="text-xl font-bold text-white mb-2">You are in a safe zone</h2>
                <p className="text-slate-400 max-w-md text-sm">
                  We are monitoring your location. If you enter a high-risk area, a safety timer will begin automatically.
                </p>
              </>
            ) : status === 'No Zones Configured' ? (
              <>
                <ShieldCheck className="w-16 h-16 text-slate-500 mb-4 opacity-80" />
                <h2 className="text-xl font-bold text-white mb-2">Safety status unavailable</h2>
                <p className="text-slate-400 max-w-md text-sm">
                  No risk zones are currently configured on the server.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-16 h-16 text-slate-500 mb-4 opacity-80" />
                <h2 className="text-xl font-bold text-white mb-2">Safety status unavailable</h2>
                <p className="text-slate-400 max-w-md text-sm">
                  {gpsError ? 'Unable to confirm safety status due to location or network errors.' : 'Determining your current location status...'}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${incident.status === 'ESCALATED' ? 'bg-rose-900/20 border-rose-500/50' : 'bg-amber-900/20 border-amber-500/50'} text-center`}>
              <ShieldAlert className={`w-12 h-12 mx-auto mb-4 ${incident.status === 'ESCALATED' ? 'text-rose-500' : 'text-amber-500 animate-pulse'}`} />
              
              <h2 className="text-2xl font-bold text-white mb-1">
                {incident.status === 'ESCALATED' ? 'EMERGENCY ESCALATION ACTIVE' : 'HIGH-RISK ZONE ENTERED'}
              </h2>
              {incident.is_demo && (
                 <div className="inline-block bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded mb-4 mt-2">
                   SIMULATED INCIDENT
                 </div>
              )}
              <p className="text-sm text-slate-300 mb-6 mt-2">
                Incident ID: <span className="font-mono text-xs">{incident.incident_id}</span><br/>
                Zone: <span className="font-semibold text-white">{incident.zone_id}</span>
              </p>

              {incident.status !== 'ESCALATED' && (
                <div className="bg-slate-950/50 rounded-lg p-6 max-w-sm mx-auto mb-6 border border-slate-800">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-2 flex justify-center items-center gap-2">
                    <Clock className="w-4 h-4" /> Time Remaining
                  </div>
                  <div className={`text-5xl font-mono font-bold tracking-wider ${timeRemaining && timeRemaining.includes('EXPIRED') ? 'text-rose-500' : 'text-amber-400'}`}>
                    {timeRemaining || '00:00'}
                  </div>
                  <div className="text-slate-500 text-xs mt-2 font-mono">
                    Deadline: {new Date(incident.deadline + 'Z').toLocaleTimeString()}
                  </div>
                </div>
              )}

              <div className="space-y-4 max-w-md mx-auto text-left bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Entry Time:</span>
                  <span className="text-slate-300 font-mono text-xs">{new Date(incident.entry_time + 'Z').toLocaleTimeString()}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Zone Exit Confirmed (GPS):</span>
                  {incident.exit_time ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle className="w-4 h-4"/> YES</span>
                  ) : (
                    <span className="text-amber-400 font-bold">WAITING...</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Driver Confirmation:</span>
                  {incident.confirmation_time ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle className="w-4 h-4"/> RECEIVED</span>
                  ) : (
                    <span className="text-amber-400 font-bold">PENDING</span>
                  )}
                </div>
              </div>

              {incident.status === 'ESCALATED' && (
                <div className="mt-6 p-4 bg-rose-500/20 rounded-lg border border-rose-500/50">
                  <p className="text-rose-200 text-sm font-semibold">
                    Escalation triggered. Emergency contacts and management have been notified. {incident.is_demo && "(MOCKED)"}
                  </p>
                </div>
              )}

              {incident.status === 'ACTIVE' && (
                <div className="mt-8">
                  <button
                    onClick={handleConfirmSafety}
                    disabled={!incident.exit_time || confirming}
                    className={`w-full max-w-md mx-auto py-4 rounded-xl font-bold text-lg transition shadow-xl flex justify-center items-center gap-2 ${
                      !incident.exit_time 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white glow-emerald'
                    }`}
                  >
                    {!incident.exit_time ? (
                      <>Drive out of zone to unlock</>
                    ) : confirming ? (
                      <>Confirming...</>
                    ) : (
                      <><ShieldCheck className="w-6 h-6"/> I AM SAFE</>
                    )}
                  </button>
                  {!incident.exit_time && (
                    <p className="text-xs text-slate-400 mt-3 max-w-xs mx-auto">
                      You must completely exit the risk zone (GPS verified) before you can confirm your safety.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
