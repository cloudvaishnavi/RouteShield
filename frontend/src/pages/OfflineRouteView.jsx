import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PageHeader from '../components/layout/PageHeader';
import { getOfflineRoute } from '../services/offlineRouteStore';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { WifiOff, ShieldAlert, Navigation, ArrowLeft, ExternalLink, MapPin, Crosshair, AlertTriangle } from 'lucide-react';
import { analyzeGPSPosition } from '../utils/navigationMath';
import { getTileUrlTemplate } from '../utils/tileDownloader';

// Fix for default leaflet icons in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons using HTML strings for offline capability
const createCustomIcon = (emoji, color) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-size: 14px;">${emoji}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const icons = {
  fuel_stations: createCustomIcon('⛽', '#f59e0b'),
  restaurants: createCustomIcon('🍴', '#3b82f6'),
  washrooms: createCustomIcon('🚻', '#8b5cf6'),
  rest_areas: createCustomIcon('🅿️', '#10b981'),
  charging_stations: createCustomIcon('⚡', '#06b6d4'),
  origin: createCustomIcon('A', '#ef4444'),
  destination: createCustomIcon('B', '#22c55e'),
  driver: createCustomIcon('🚙', '#3b82f6')
};

function MapBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
}

function MapFollow({ position, isFollowing }) {
  const map = useMap();
  useEffect(() => {
    if (isFollowing && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, isFollowing, map]);
  return null;
}

export default function OfflineRouteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [navStats, setNavStats] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [gpsError, setGpsError] = useState('');

  useEffect(() => {
    loadRoute();
  }, [id]);

  const [navState, setNavState] = useState('IDLE'); // IDLE, ACTIVE, PAUSED

  useEffect(() => {
    let watchId;
    if (navState === 'ACTIVE' && "geolocation" in navigator && route?.route_geometry?.coordinates) {
      setGpsError(''); // clear any previous error when starting
      
      const coords = route.route_geometry.coordinates
        .map(c => [Number(c[1]), Number(c[0])])
        .filter(c => !isNaN(c[0]) && !isNaN(c[1]));

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed, accuracy } = pos.coords;
          
          // Ignore highly inaccurate GPS readings (e.g., cell tower triangulation without GPS fix)
          if (accuracy > 1000) {
             console.warn(`Ignoring inaccurate GPS reading: ${Math.round(accuracy)}m`);
             return;
          }

          setGpsPosition([latitude, longitude]);
          setGpsAccuracy(accuracy);

          if (coords.length > 0) {
            setNavStats((prev) => {
              const prevIndex = prev?.closestSegmentIndex || 0;
              const stats = analyzeGPSPosition(latitude, longitude, coords, prevIndex);
              if (!stats) return prev;
              
              const speedKmH = speed ? speed * 3.6 : 60; // default to 60km/h if speed is null
              const etaHours = stats.remainingDistanceKm / Math.max(speedKmH, 1);
              
              let consecutiveDeviations = prev?.consecutiveDeviations || 0;
              if (stats.isDeviated) {
                consecutiveDeviations++;
              } else {
                consecutiveDeviations = 0;
              }
              return { ...stats, speedKmH, etaHours, consecutiveDeviations, isConfirmedDeviated: consecutiveDeviations >= 3 };
            });
          }
        },
        (err) => {
           console.warn('GPS Error:', err);
           setGpsError(err.message || 'Location permission denied or unavailable');
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
      );
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [navState, route]);

  const loadRoute = async () => {
    try {
      const saved = await getOfflineRoute(id);
      setRoute(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading offline route...</div>;
  if (!route) return <div className="text-rose-400">Route not found in offline storage.</div>;

  const isValidCoord = (lat, lon) => {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    return !isNaN(latNum) && !isNaN(lonNum) &&
           latNum >= -90 && latNum <= 90 && 
           lonNum >= -180 && lonNum <= 180;
  };

  const extractValidLatLng = (obj) => {
    if (!obj) return null;
    let lat = obj.lat !== undefined ? obj.lat : obj.latitude;
    let lon = obj.lng !== undefined ? obj.lng : (obj.lon !== undefined ? obj.lon : obj.longitude);
    if (isValidCoord(lat, lon)) {
      return [Number(lat), Number(lon)];
    }
    return null;
  };

  // Extract coordinates for Polyline [lat, lon]
  const pathCoords = (route.route_geometry?.coordinates || [])
    .map(c => (Array.isArray(c) && c.length >= 2) ? [Number(c[1]), Number(c[0])] : null)
    .filter(c => c !== null && isValidCoord(c[0], c[1]));
  
  // Collect all POIs to render
  const poiMarkers = [];
  if (route.pois) {
    Object.entries(route.pois).forEach(([category, list]) => {
      list.forEach(poi => {
        const pos = extractValidLatLng(poi);
        if (pos) {
          poiMarkers.push({
            ...poi,
            category,
            position: pos
          });
        }
      });
    });
  }

  const originPos = extractValidLatLng(route.origin);
  const destPos = extractValidLatLng(route.destination);
  
  const defaultCenter = originPos || destPos || (pathCoords.length > 0 ? pathCoords[0] : [0, 0]);

  const openGoogleMaps = () => {
    if (route.google_maps_url) {
      window.open(route.google_maps_url, '_blank');
      return;
    }
    if (route.origin?.name && route.destination?.name) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(route.origin.name)}&destination=${encodeURIComponent(route.destination.name)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${route.origin?.name?.split(',')[0] || 'Unknown Origin'} → ${route.destination?.name?.split(',')[0] || 'Unknown Destination'}`}
        subtitle="Saved Offline Route"
        action={
          <button onClick={() => navigate('/saved-routes')} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        }
      />

      {(!route.origin || !route.destination || !route.route_geometry) && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">INCOMPLETE ROUTE DATA</h4>
            <p className="text-xs opacity-80">This route was saved with missing coordinate or origin data. Please <button onClick={() => navigate('/analyze')} className="underline hover:text-rose-300">re-analyze this route</button> to generate the full interactive map, geometry, and essentials.</p>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3 text-amber-400">
          <WifiOff className="w-5 h-5" />
          <div>
            <h4 className="font-bold text-sm">OFFLINE MODE</h4>
            <p className="text-xs opacity-80">Internet connection unavailable. Showing cached RouteShield data. Background map tiles may not load, but route geometry and POIs are available.</p>
          </div>
        </div>
      )}

      {tileError && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">MAP TILES UNAVAILABLE</h4>
            <p className="text-xs opacity-80">Some map areas could not be loaded because they were not cached for offline use.</p>
          </div>
        </div>
      )}

      {gpsError && navState !== 'IDLE' && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-400">
          <MapPin className="w-5 h-5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">LOCATION UNAVAILABLE</h4>
            <p className="text-xs opacity-80">{gpsError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">Route Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-400">Origin</div>
                    <div className="text-sm font-semibold text-white">{route.origin?.name || 'Unknown'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-400">Destination</div>
                    <div className="text-sm font-semibold text-white">{route.destination?.name || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div>
                <div className="text-xs text-slate-400">Total Distance</div>
                <div className="text-lg font-mono font-bold text-cyan-400">{route.distance_km} km</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Duration</div>
                <div className="text-lg font-mono font-bold text-white">~{Math.floor((route.duration_minutes||0)/60)}h {Math.round((route.duration_minutes||0)%60)}m</div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-400 text-xs font-bold uppercase">Navigation Controls</h3>
                {navState !== 'IDLE' && (
                  <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${isFollowing ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    {isFollowing ? 'Following' : 'Center on Me'}
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                {navState === 'IDLE' && (
                  <button onClick={() => { setNavState('ACTIVE'); setIsFollowing(true); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2">
                    <Navigation className="w-4 h-4" /> Start Navigation
                  </button>
                )}
                {navState === 'ACTIVE' && (
                  <button onClick={() => setNavState('PAUSED')} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2">
                     Pause
                  </button>
                )}
                {navState === 'PAUSED' && (
                  <button onClick={() => setNavState('ACTIVE')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2">
                     Resume
                  </button>
                )}
                {navState !== 'IDLE' && (
                  <button onClick={() => { setNavState('IDLE'); setNavStats(null); setGpsPosition(null); }} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2">
                     End
                  </button>
                )}
              </div>

              {navState === 'ACTIVE' && !gpsPosition && !gpsError && (
                <div className="text-xs text-amber-400 text-center font-medium animate-pulse">
                  Waiting for GPS...
                </div>
              )}
              {navState === 'ACTIVE' && gpsPosition && !gpsError && (
                <div className="text-xs text-emerald-400 text-center font-medium">
                  Live location updated
                </div>
              )}

              {navState !== 'IDLE' && navStats && (
                <>
                  {navStats.isConfirmedDeviated && !gpsError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-400 flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <p>You have deviated from the saved route! New routes cannot be calculated offline.</p>
                    </div>
                  )}
                  
                  <div className={`grid grid-cols-2 gap-4 ${gpsError ? 'opacity-50' : ''}`}>
                    <div>
                      <div className="text-xs text-slate-400">Remaining Dist. {gpsError && '(Stale)'}</div>
                      <div className="text-lg font-mono font-bold text-emerald-400">{navStats.remainingDistanceKm.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Approx. ETA {gpsError && '(Stale)'}</div>
                      <div className="text-lg font-mono font-bold text-emerald-400">
                        {Math.floor(navStats.etaHours)}h {Math.round((navStats.etaHours % 1) * 60)}m
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {pathCoords.length === 0 && (
              <div className="border-t border-slate-800 pt-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-400 flex items-start gap-2 text-xs">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <p>Route geometry is missing or invalid. Please re-analyze and save the route again.</p>
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className={`w-5 h-5 ${route.risk?.level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`} />
                <h3 className="font-bold text-white">Risk: {route.risk?.level}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{route.recommendation?.reason}</p>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Cached Essentials</h3>
              {(!route.pois || Object.values(route.pois).every(list => !list || list.length === 0)) ? (
                <div className="text-xs text-slate-500 italic">No cached locations available.</div>
              ) : (
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>⛽ Fuel: {route.pois?.fuel_stations?.length || 0}</div>
                <div>🍴 Food: {route.pois?.restaurants?.length || 0}</div>
                <div>🚻 Restrooms: {route.pois?.washrooms?.length || 0}</div>
                <div>⚡ EV: {route.pois?.charging_stations?.length || 0}</div>
              </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4">
              <button 
                onClick={openGoogleMaps}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-sm font-semibold transition border border-cyan-500/30 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Google Maps (Online)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative z-0">
          <MapContainer 
            center={defaultCenter} 
            zoom={10} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
              url={getTileUrlTemplate()}
              maxNativeZoom={14}
              maxZoom={18}
              eventHandlers={{
                tileerror: () => setTileError(true)
              }}
            />
            
            {pathCoords.length > 0 && (
              <>
                <Polyline positions={pathCoords} color="#06b6d4" weight={4} opacity={0.8} />
                {!isFollowing && <MapBounds coords={pathCoords} />}
              </>
            )}

            <MapFollow position={gpsPosition} isFollowing={isFollowing} />

            {gpsPosition && (
              <>
                {gpsAccuracy && gpsAccuracy < 1000 && (
                  <Circle center={gpsPosition} radius={gpsAccuracy} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} />
                )}
                <Marker position={gpsPosition} icon={icons.driver}>
                  <Popup className="text-slate-900"><strong className="block mb-1">Current Position</strong>You are here</Popup>
                </Marker>
              </>
            )}

            {originPos && (
              <Marker position={originPos} icon={icons.origin}>
                <Popup className="text-slate-900"><strong className="block mb-1">Origin</strong>{route.origin.name}</Popup>
              </Marker>
            )}

            {destPos && (
              <Marker position={destPos} icon={icons.destination}>
                <Popup className="text-slate-900"><strong className="block mb-1">Destination</strong>{route.destination.name}</Popup>
              </Marker>
            )}

            {poiMarkers.map(poi => (
              <Marker 
                key={poi.id || Math.random().toString()} 
                position={poi.position} 
                icon={icons[poi.category] || icons.rest_areas}
              >
                <Popup className="text-slate-900">
                  <strong className="block mb-1">{poi.name}</strong>
                  <span className="text-xs capitalize text-slate-500 block mb-1">{poi.category.replace('_', ' ')}</span>
                  {poi.address && <span className="text-xs block">{poi.address}</span>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
