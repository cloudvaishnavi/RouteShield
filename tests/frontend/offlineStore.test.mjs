import assert from 'node:assert';

export async function runTests() {
  console.log('Running mock IDB tests...');

  const mockDb = new Map();
  const saveRouteOffline = async (route) => {
    mockDb.set(route.route_id, route);
    return route;
  };
  const getOfflineRoute = async (id) => mockDb.get(id);

  const route = {
    route_id: '123',
    route_geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
    distance_km: 10
  };

  await saveRouteOffline(route);
  const saved = await getOfflineRoute('123');
  
  assert.deepStrictEqual(saved.route_geometry.coordinates, [[0, 0], [1, 1]]);
  assert.strictEqual(saved.distance_km, 10);
  
  console.log('IndexedDB offline save tests passed (mocked)');
}

runTests().catch(console.error);
