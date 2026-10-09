// offlineRouteStore.js
// Basic IndexedDB wrapper for offline routes

const DB_NAME = 'RouteShieldOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'savedRoutes';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'route_id' });
      }
    };
  });
}

export async function saveRouteOffline(route) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(route);

    request.onsuccess = () => resolve(route);
    request.onerror = (event) => reject('Error saving offline route: ' + event.target.error);
  });
}

export async function getOfflineRoutes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject('Error fetching offline routes: ' + event.target.error);
  });
}

export async function getOfflineRoute(routeId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(routeId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject('Error fetching offline route: ' + event.target.error);
  });
}

export async function deleteOfflineRoute(routeId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(routeId);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject('Error deleting offline route: ' + event.target.error);
  });
}

export async function clearOfflineRoutes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject('Error clearing offline routes: ' + event.target.error);
  });
}
