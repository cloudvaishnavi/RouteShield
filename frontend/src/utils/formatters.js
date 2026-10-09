/**
 * General purpose formatting functions
 */

export const formatDistance = (km) => {
  if (!km && km !== 0) return 'N/A';
  return `${Number(km).toLocaleString()} km`;
};

export const formatNumber = (num, decimals = 1) => {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const humanizeFeatureName = (feature) => {
  if (!feature) return 'Unknown Factor';
  
  const mappings = {
    'Geopolitical_Risk_Score': 'Geopolitical Corridor Risk',
    'Carrier_Reliability_Score': 'Carrier Reliability Index',
    'Fuel_Price_Index': 'Fuel Price Fluctuations',
    'Weather_Condition': 'Adverse Weather Impact',
    'Distance_km': 'Route Distance Trajectory',
    'Lead_Time_Days': 'Lead Time Variance',
    'Weight_MT': 'Cargo Tonnage Load',
    'Product_Category': 'Commodity Category Sensitivity',
    'Transport_Mode': 'Transport Mode Vulnerability',
    'Origin_Port': 'Origin Port Congestion',
    'Destination_Port': 'Destination Port Staging Queue',
  };

  for (const [key, label] of Object.entries(mappings)) {
    if (feature.includes(key)) {
      return label;
    }
  }

  // Fallback cleanup
  return feature
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
};
