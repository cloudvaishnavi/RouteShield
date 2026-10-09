import { request } from './api';

/**
 * Route evaluation service endpoint wrapper
 */
export async function evaluateRoutesApi(currentRoute, alternativeRoutes) {
  return await request('/api/routes', {
    method: 'POST',
    body: JSON.stringify({
      current_route: currentRoute,
      alternative_routes: alternativeRoutes,
    }),
  });
}

/**
 * Route calculation service endpoint wrapper
 */
export async function calculateRouteApi(origin, destination) {
  return await request('/api/routes/calculate', {
    method: 'POST',
    body: JSON.stringify({
      origin,
      destination,
    }),
  });
}
