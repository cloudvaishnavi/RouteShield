export const getTileUrlTemplate = () => {
  return import.meta.env.VITE_TILE_URL || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
};

export const isPrefetchAllowed = () => {
  const url = getTileUrlTemplate();
  // ESRI allows caching for offline use. OpenStreetMap strictly forbids it.
  return import.meta.env.VITE_ALLOW_PREFETCH === 'true' || !url.includes('tile.openstreetmap.org');
};

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

export async function downloadTilesForRoute(routeCoords, zoomLevels = [10, 11, 12, 13, 14], onProgress, signal) {
  if (!isPrefetchAllowed()) {
    throw new Error('Prefetching is not allowed for the current tile provider.');
  }
  
  if (!routeCoords || routeCoords.length === 0) return 0;

  const tilesToDownloadSet = new Set();
  const template = getTileUrlTemplate();

  // For each point, find the tile it belongs to and add a 1-tile buffer
  for (const [lat, lon] of routeCoords) {
    for (const z of zoomLevels) {
      const x = lon2tile(lon, z);
      const y = lat2tile(lat, z);
      
      // Add a 1-tile radius buffer around the route to ensure visibility when panning slightly
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const url = template
            .replace('{z}', z)
            .replace('{x}', x + dx)
            .replace('{y}', y + dy)
            .replace('{s}', 'a')
            .replace('{r}', '');
          tilesToDownloadSet.add(url);
        }
      }
    }
  }

  const tilesToDownload = Array.from(tilesToDownloadSet);

  // Limit download to prevent abuse
  const MAX_TILES = 1500;
  if (tilesToDownload.length > MAX_TILES) {
    throw new Error(`Route is too long. Requires ${tilesToDownload.length} tiles (max ${MAX_TILES}). Try a shorter route or fewer zoom levels.`);
  }

  const cache = await caches.open('routeshield-tiles-v1');
  let downloaded = 0;

  for (let i = 0; i < tilesToDownload.length; i++) {
    if (signal && signal.aborted) {
      throw new Error('Download cancelled');
    }
    const url = tilesToDownload[i];
    try {
      const response = await fetch(url, { mode: 'cors', signal });
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (e) {
      if (e.name === 'AbortError') {
         throw new Error('Download cancelled');
      }
      console.warn('Failed to cache tile:', url);
    }
    downloaded++;
    if (onProgress) onProgress(downloaded, tilesToDownload.length);
  }

  return downloaded;
}

export async function clearTileCache() {
  await caches.delete('routeshield-tiles-v1');
}

export async function getTileCacheSize() {
  const cache = await caches.open('routeshield-tiles-v1');
  const keys = await cache.keys();
  // Rough estimate: 20kb per tile
  return (keys.length * 20 * 1024);
}
