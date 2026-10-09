/**
 * Base API client configuration and fetch wrapper
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `HTTP Error ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.details = data?.error?.details || data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn('Network connection failed to Flask backend at:', url);
      const netErr = new Error('RouteShield backend service is currently unreachable.');
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw error;
  }
}

export async function checkHealth() {
  try {
    return await request('/api/health');
  } catch (err) {
    return {
      success: false,
      status: 'offline',
      error: err.message,
      model_loaded: false,
    };
  }
}
