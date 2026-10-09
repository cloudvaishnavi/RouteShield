import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    let pingInterval;

    const checkBackend = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }
      try {
        const res = await fetch('/api/health', { 
          method: 'GET', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        setIsOnline(res.ok || res.status === 404); // some backends don't have health but are up
      } catch (e) {
        setIsOnline(false);
      }
    };

    const handleOnline = () => {
      checkBackend();
      pingInterval = setInterval(checkBackend, 15000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (pingInterval) clearInterval(pingInterval);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (pingInterval) clearInterval(pingInterval);
    };
  }, []);

  return isOnline;
}
