
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

import PageHeader from '../components/layout/PageHeader';
import RiskGauge from '../components/results/RiskGauge';
import DisruptionCard from '../components/results/DisruptionCard';
import ExplanationPanel from '../components/results/ExplanationPanel';
import RecommendationCard from '../components/results/RecommendationCard';
import RouteComparison from '../components/results/RouteComparison';
import WeatherPanel from '../components/results/WeatherPanel';
import AgentActivity from '../components/results/AgentActivity';
import RagInsightsPanel from '../components/results/RagInsightsPanel';

import { PlusCircle, RotateCcw, Download } from 'lucide-react';
import { getAnalysisHistory } from '../utils/storage';
import { saveRouteApi } from '../services/savedRoutesApi';
import { saveRouteOffline } from '../services/offlineRouteStore';
import { downloadTilesForRoute, isPrefetchAllowed } from '../utils/tileDownloader';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);

  // Retrieve analysis data passed from the previous page.
  const stateData = location.state || {};
  const historyList = getAnalysisHistory();
  const fallbackRecord = historyList.length > 0 ? historyList[0] : null;

  const resultData =
    stateData.resultData ||
    fallbackRecord?.apiResult ||
    {};

  const inputData =
    stateData.inputData ||
    fallbackRecord?.inputData ||
    {};

  const prediction = resultData?.prediction || {};
  const recommendation = resultData?.recommendation || {};
  const explanation = resultData?.explanation || {};
  const routeAnalysis = resultData?.route_analysis || {};
  const agentData = resultData?.agent || {};

  // This must be the actual response from /api/routes/calculate.
  const routeResult = stateData.routeResult || null;

  const [abortController, setAbortController] = useState(null);

  const handleCancelDownload = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const handleSaveOffline = async () => {
    if (saving || saved) return;

    setSaving(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const route = routeResult || routeAnalysis || {};
      const origin = route.origin || {};
      const destination = route.destination || {};
      const distance = Number(route.distance_km || route.current_route?.distance_km);
      const duration = Number(route.duration_minutes);
      const geometry = route.route_geometry;
      const coordinates = geometry?.coordinates;

      if (
        geometry?.type !== 'LineString' ||
        !Array.isArray(coordinates) ||
        coordinates.length < 2
      ) {
        throw new Error(
          'Valid road-route geometry is missing. Recalculate the route before saving.'
        );
      }

      const validPoint = (point) =>
        Array.isArray(point) &&
        point.length >= 2 &&
        Number.isFinite(Number(point[0])) &&
        Number.isFinite(Number(point[1])) &&
        Number(point[0]) >= -180 &&
        Number(point[0]) <= 180 &&
        Number(point[1]) >= -90 &&
        Number(point[1]) <= 90;

      if (!coordinates.every(validPoint)) {
        throw new Error(
          'The route contains invalid coordinates. Please recalculate it.'
        );
      }

      const hasValidLocation = (location) =>
        Boolean(
          location?.name &&
          Number.isFinite(Number(location.latitude)) &&
          Number.isFinite(Number(location.longitude)) &&
          Number(location.latitude) >= -90 &&
          Number(location.latitude) <= 90 &&
          Number(location.longitude) >= -180 &&
          Number(location.longitude) <= 180
        );

      if (
        !hasValidLocation(origin) ||
        !hasValidLocation(destination)
      ) {
        throw new Error(
          'Origin or destination details are missing. Please recalculate the route.'
        );
      }

      if (!Number.isFinite(distance) || distance <= 0) {
        throw new Error('The route distance is invalid.');
      }

      if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error(
          'The road-route duration is unavailable. Please recalculate the route.'
        );
      }

      const payload = {
        origin: origin,
        destination: destination,
        distance_km: distance,
        duration_minutes: duration,
        route_geometry: geometry,
        google_maps_url: route.google_maps_url || '',
        route_summary: recommendation.reason || '',
        risk: {
          score: prediction.risk_score ?? null,
          level: prediction.risk_level ?? 'UNKNOWN',
        },
        recommendation,
      };

      // Save the route on the backend.
      const response = await saveRouteApi(payload);

      // Support either { data: route } or a direct route response.
      const savedRoute = response?.data ?? response;

      if (!savedRoute?.route_id) {
        throw new Error(
          'The backend did not return a route ID. Check the API response.'
        );
      }

      // Save only the route record to IndexedDB.
      await saveRouteOffline(savedRoute);

      let tileMessage = "Map tiles omitted (provider restricts bulk downloads).";
      if (isPrefetchAllowed() && geometry?.coordinates) {
        try {
          const latLonCoords = coordinates.map(c => [c[1], c[0]]);
          await downloadTilesForRoute(latLonCoords, [10, 12, 14], (done, total) => {
             setDownloadProgress(done);
             setDownloadTotal(total);
          }, controller.signal);
          tileMessage = "Map tiles successfully downloaded.";
        } catch (tileErr) {
          console.error("Tile download failed:", tileErr);
          if (tileErr.message === 'Download cancelled') {
             throw new Error('Download cancelled by user.');
          }
          throw new Error(`Route saved, but map tiles failed to download: ${tileErr.message}. Route is not fully offline-ready.`);
        }
      }

      setSaved(true);
      window.alert(`Route saved successfully. ${tileMessage}`);

      // Keep the user on Results; the offline route can be opened
      // from the saved-routes list using savedRoute.route_id.
    } catch (error) {
      console.error('Failed to save route offline:', error);
      window.alert(error.message || 'Failed to save the route.');
    } finally {
      setSaving(false);
      setDownloadTotal(0);
      setDownloadProgress(0);
      setAbortController(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disruption Risk & Decision Intelligence"
        subtitle={`Analysis output for corridor ${inputData.Origin_Port || 'Origin'
          } → ${inputData.Destination_Port || 'Destination'}`}
        action={
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveOffline}
              disabled={saving || saved}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border ${saved
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700 hover:border-cyan-500/50'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {downloadTotal > 0 
                      ? `Downloading Maps (${downloadProgress}/${downloadTotal})` 
                      : 'Saving...'}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{saved ? 'Ready for Offline Navigation' : 'Download for Offline Use'}</span>
                </>
              )}
            </button>

            {saving && abortController && (
              <button
                onClick={handleCancelDownload}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center space-x-1.5 transition border border-rose-500/30"
              >
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={() => navigate('/analyze')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-Analyze</span>
            </button>

            <Link
              to="/analyze"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition glow-cyan"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Analysis</span>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecommendationCard
            recommendation={recommendation}
            inputData={inputData}
          />

          <DisruptionCard
            inputData={inputData}
            resultData={resultData}
          />
        </div>

        <div>
          <RiskGauge
            riskScore={prediction.risk_score ?? 0.5}
            confidence={prediction.confidence ?? 0.8}
            isDisrupted={prediction.predicted_disruption}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExplanationPanel
          contributions={prediction.contributions || []}
          mainFactors={explanation.main_factors || []}
        />

        <WeatherPanel inputData={inputData} />
      </div>

      <RagInsightsPanel inputData={inputData} prediction={prediction} />

      <RouteComparison
        routeAnalysis={routeAnalysis}
        recommendation={recommendation}
        inputData={inputData}
      />

      <AgentActivity agentData={agentData} />
    </div>
  );
}
