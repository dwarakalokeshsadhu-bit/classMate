// Centralized API configuration supporting Vercel frontend + Render backend deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

/**
 * Returns the fully qualified or relative API URL.
 * In local dev (or unified Express serving): returns '/api/...'
 * In Vercel deployment with VITE_API_URL set: returns 'https://your-backend.onrender.com/api/...'
 */
export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Standardized fetch helper for authenticated requests.
 * Transports both httpOnly cookies (credentials: include) AND Authorization Bearer header
 * to guarantee authentication across third-party cross-site deployments (e.g. Vercel -> Render).
 */
export const authFetch = (endpoint, options = {}) => {
  const url = apiUrl(endpoint);
  let token = null;
  try {
    token = localStorage.getItem('pm_token');
  } catch (e) {}

  const headers = {
    ...(options.headers || {})
  };

  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
};
