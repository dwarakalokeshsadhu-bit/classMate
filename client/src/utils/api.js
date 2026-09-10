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
