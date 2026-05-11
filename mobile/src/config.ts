// ── API Base URL ──────────────────────────────────────────────────────────────
// Your existing Vercel deployment — all /api/* routes are already live there.
// Replace with your actual Vercel URL (check vercel.com dashboard or run `vercel ls`)
export const API_BASE = 'https://morning-briefing.vercel.app';

// Convenience helpers
export const api = {
  weather:  `${API_BASE}/api/weather`,
  spotify:  `${API_BASE}/api/spotify`,
  gmail:    `${API_BASE}/api/gmail`,
  calendar: `${API_BASE}/api/calendar`,
  notion:   `${API_BASE}/api/notion`,
  news:     `${API_BASE}/api/news`,
};

// Race goal
export const RACE_DATE = new Date('2026-06-13T09:00:00');
export const RACE_DISTANCE_KM = 10;
export const RACE_LOCATION = 'Rajec, Slovakia';
