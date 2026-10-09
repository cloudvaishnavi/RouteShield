// Haversine distance in km
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance from point to a line segment
export function pointToSegmentDistance(px, py, ax, ay, bx, by) {
  const l2 = Math.pow(ax - bx, 2) + Math.pow(ay - by, 2);
  if (l2 === 0) return getDistanceKm(px, py, ax, ay);
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projectionX = ax + t * (bx - ax);
  const projectionY = ay + t * (by - ay);
  return getDistanceKm(px, py, projectionX, projectionY);
}

// Check deviation and get distance along route
export function analyzeGPSPosition(currentLat, currentLon, routeCoords, prevSegmentIndex = 0) {
  // routeCoords is array of [lat, lon]
  if (!routeCoords || routeCoords.length < 2) return null;

  let minDistance = Infinity;
  let closestSegmentIndex = prevSegmentIndex;
  let bestT = 0;

  // Search from the current position forward (up to 500 segments or the end)
  // We also search a little bit backwards (up to 20 segments) in case of small GPS drift
  const searchStart = Math.max(0, prevSegmentIndex - 20);
  const searchEnd = Math.min(routeCoords.length - 1, prevSegmentIndex + 500);

  for (let i = searchStart; i < searchEnd; i++) {
    const [lat1, lon1] = routeCoords[i];
    const [lat2, lon2] = routeCoords[i + 1];
    
    // Quick euclidean approximation for projection t
    const l2 = Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2);
    let t = 0;
    if (l2 > 0) {
      t = ((currentLat - lat1) * (lat2 - lat1) + (currentLon - lon1) * (lon2 - lon1)) / l2;
      t = Math.max(0, Math.min(1, t));
    }
    
    const projLat = lat1 + t * (lat2 - lat1);
    const projLon = lon1 + t * (lon2 - lon1);
    
    const dist = getDistanceKm(currentLat, currentLon, projLat, projLon);
    
    if (dist < minDistance) {
      minDistance = dist;
      closestSegmentIndex = i;
      bestT = t;
    }
  }

  // If the closest segment found in the window is too far, it might be a deviation.
  // Or we might have completely lost the track.
  // We do a global search ONLY if we are significantly deviated from our window
  if (minDistance > 2.0) {
    minDistance = Infinity;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const [lat1, lon1] = routeCoords[i];
      const [lat2, lon2] = routeCoords[i + 1];
      const l2 = Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2);
      let t = 0;
      if (l2 > 0) {
        t = ((currentLat - lat1) * (lat2 - lat1) + (currentLon - lon1) * (lon2 - lon1)) / l2;
        t = Math.max(0, Math.min(1, t));
      }
      const projLat = lat1 + t * (lat2 - lat1);
      const projLon = lon1 + t * (lon2 - lon1);
      const dist = getDistanceKm(currentLat, currentLon, projLat, projLon);
      if (dist < minDistance) {
        minDistance = dist;
        closestSegmentIndex = i;
        bestT = t;
      }
    }
  }

  // 500 meters deviation threshold to prevent false positives from GPS noise
  const isDeviated = minDistance > 0.5;

  let remainingDistance = 0;

  // Add the remaining part of the current segment
  const [lat1, lon1] = routeCoords[closestSegmentIndex];
  const [lat2, lon2] = routeCoords[closestSegmentIndex + 1];
  const projLat = lat1 + bestT * (lat2 - lat1);
  const projLon = lon1 + bestT * (lon2 - lon1);
  
  remainingDistance += getDistanceKm(projLat, projLon, lat2, lon2);

  // Add all subsequent segments
  for (let i = closestSegmentIndex + 1; i < routeCoords.length - 1; i++) {
    remainingDistance += getDistanceKm(
      routeCoords[i][0], routeCoords[i][1],
      routeCoords[i + 1][0], routeCoords[i + 1][1]
    );
  }

  return {
    isDeviated,
    deviationDistance: minDistance,
    remainingDistanceKm: remainingDistance,
    closestSegmentIndex
  };
}
