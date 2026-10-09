import { request } from './api';

/**
 * Execute full multi-agent disruption analysis workflow
 */
export async function analyzeRoute(formData) {
  // Ensure fields are converted to correct types
  const logisticsData = {
    Origin_Port: String(formData.Origin_Port || 'Port of Shanghai'),
    Destination_Port: String(formData.Destination_Port || 'Port of Los Angeles'),
    Transport_Mode: String(formData.Transport_Mode || 'Maritime'),
    Product_Category: String(formData.Product_Category || 'Electronics'),
    Distance_km: Number(formData.Distance_km || 10450),
    Weight_MT: Number(formData.Weight_MT || 120),
    Fuel_Price_Index: Number(formData.Fuel_Price_Index || 1.25),
    Geopolitical_Risk_Score: Number(formData.Geopolitical_Risk_Score || 0.45),
    Weather_Condition: String(formData.Weather_Condition || 'Stormy'),
    Carrier_Reliability_Score: Number(formData.Carrier_Reliability_Score || 0.85),
    Lead_Time_Days: Number(formData.Lead_Time_Days || 14),
    Year: Number(formData.Year || 2026),
    Month: Number(formData.Month || 10),
    Day_of_Week: Number(formData.Day_of_Week || 4),
  };

  // Derive initial current route and alternative route structure
  const currentRoute = {
    name: `${logisticsData.Origin_Port} → ${logisticsData.Destination_Port} (Direct)`,
    origin: logisticsData.Origin_Port,
    destination: logisticsData.Destination_Port,
    mode: logisticsData.Transport_Mode,
    distance_km: logisticsData.Distance_km,
    eta_days: logisticsData.Lead_Time_Days,
    route_geometry: formData.route_geometry,
    route_origin_data: formData.route_origin_data,
    route_destination_data: formData.route_destination_data,
    duration_minutes: formData.route_duration
  };

  const alternativeRoutes = [];

  const payload = {
    logistics_data: logisticsData,
    current_route: currentRoute,
    alternative_routes: alternativeRoutes,
  };

  return await request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Direct raw prediction request to /api/prediction
 */
export async function getRawPrediction(logisticsData) {
  return await request('/api/prediction', {
    method: 'POST',
    body: JSON.stringify(logisticsData),
  });
}
