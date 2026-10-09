import { getDistanceKm, pointToSegmentDistance, analyzeGPSPosition } from '../../frontend/src/utils/navigationMath.js';
import assert from 'node:assert';

export async function runTests() {
  console.log('Running navigationMath tests...');

  // Test getDistanceKm
  const dist = getDistanceKm(0, 0, 0, 1);
  assert(Math.abs(dist - 111.32) < 1, 'Distance at equator should be ~111km');

  // Test analyzeGPSPosition
  // Create a U-shaped route that doubles back close to the start
  const route = [
    [0, 0],   // index 0
    [0, 1],   // index 1
    [0, 2],   // index 2
    [1, 2],   // index 3
    [1, 1],   // index 4
    [1, 0.1]  // index 5 - very close to index 0/1
  ];
  
  // Point right at [0, 0.5]
  const stats1 = analyzeGPSPosition(0, 0.5, route, 0);
  assert(stats1 !== null, 'Should return stats');
  assert(stats1.isDeviated === false, 'Should not be deviated for small error');
  assert.strictEqual(stats1.closestSegmentIndex, 0, 'Should snap to the first segment');

  // If we are currently at index 4 ([1,1]) and the GPS gives a point near [1, 0.5],
  // the distance to segment 0 ([0,0] to [0,1]) is 1 degree (~111km).
  // The distance to segment 4 ([1,1] to [1,0.1]) is 0.
  // By passing prevSegmentIndex = 4, it should snap to segment 4, not segment 0.
  const stats2 = analyzeGPSPosition(1, 0.5, route, 4);
  assert.strictEqual(stats2.closestSegmentIndex, 4, 'Should snap to segment 4 due to windowing');
  assert(stats2.remainingDistanceKm < 50, 'Remaining distance should be calculated from segment 4');

  // Simulate deviation
  const statsDeviated = analyzeGPSPosition(5, 5, route, 0);
  assert(statsDeviated.isDeviated === true, 'Should be deviated for large error (>500m)');
  
  console.log('All navigationMath tests passed!');
}

runTests().catch(console.error);
