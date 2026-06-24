import axios from 'axios';

/**
 * API base URL strategy:
 *  1. In production (Docker): Nginx proxies /api → backend:5000, so we use relative /api
 *  2. In local dev: Vite dev server proxies /api → localhost:5000, same relative path
 *  3. Override with VITE_API_URL env var for custom deployments
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[CausalFunnel API]', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// ─── API Methods ───────────────────────────────────────────────

/** GET /analytics/summary — High-level metrics */
export const getAnalyticsSummary = () =>
  api.get('/analytics/summary').then(r => r.data);

/** GET /sessions — All sessions sorted by last activity */
export const getSessions = () =>
  api.get('/sessions').then(r => r.data);

/** GET /sessions/:sessionId — Full event timeline */
export const getSessionJourney = (sessionId) =>
  api.get(`/sessions/${encodeURIComponent(sessionId)}`).then(r => r.data);

/** GET /pages — All distinct page URLs that have been tracked */
export const getTrackedPages = () =>
  api.get('/pages').then(r => r.data);

/** GET /heatmap?url=... — Click coordinates for a page URL */
export const getHeatmapData = (url) =>
  api.get('/heatmap', { params: { url } }).then(r => r.data);

/** POST /events — Send a tracking event (used by tracker.js) */
export const postEvent = (payload) =>
  api.post('/events', payload).then(r => r.data);

export default api;
