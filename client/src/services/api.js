import axios from 'axios';

// Central Axios instance. Cookies (JWT) are sent automatically.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', withCredentials: true, timeout: 20000 });

// CSRF token (received from login and /user/me) is kept in memory and sent on state-changing requests.
let csrfToken = '';
export const setCsrfToken = (t) => { csrfToken = t || ''; };

api.interceptors.request.use((config) => {
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

/** Extracts a human-readable message from an Axios error. */
export const getErrorMessage = (err) =>
  err.response?.data?.message || (err.code === 'ECONNABORTED' ? 'Request timed out' : err.request ? 'Cannot reach the server. Check your connection.' : err.message);

export default api;
