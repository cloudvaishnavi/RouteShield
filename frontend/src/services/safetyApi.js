import { request } from './api';

export async function updateLocation(lat, lng, options = {}) {
  const { driverId = 'anonymous_driver', isDemo = false, accelerated = false } = options;
  return await request('/api/safety/location', {
    method: 'POST',
    body: JSON.stringify({ lat, lng, driver_id: driverId, is_demo: isDemo, accelerated })
  });
}

export async function confirmSafety(incidentId, driverId = 'anonymous_driver') {
  return await request('/api/safety/confirm', {
    method: 'POST',
    body: JSON.stringify({ incident_id: incidentId, driver_id: driverId })
  });
}

export async function getSafetyStatus(driverId = 'anonymous_driver') {
  return await request(`/api/safety/status?driver_id=${driverId}`);
}

export async function configureZone(zoneData) {
  return await request('/api/safety/zones', {
    method: 'POST',
    body: JSON.stringify(zoneData)
  });
}
