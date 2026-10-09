import { request } from './api';

export async function saveRouteApi(routeData) {
  return await request('/api/routes/save', {
    method: 'POST',
    body: JSON.stringify(routeData),
  });
}

export async function getSavedRoutesApi() {
  return await request('/api/routes/saved');
}

export async function getSingleSavedRouteApi(routeId) {
  return await request(`/api/routes/saved/${routeId}`);
}

export async function deleteSavedRouteApi(routeId) {
  return await request(`/api/routes/saved/${routeId}`, {
    method: 'DELETE'
  });
}
