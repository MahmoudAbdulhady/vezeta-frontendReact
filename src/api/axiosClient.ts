import axios from 'axios';

// Token stored in memory (never localStorage)
let _token: string | null = null;

export const setToken = (token: string | null) => { _token = token; };
export const getToken = () => _token;

// In dev, use same-origin `/api/*` so Vite proxies to the backend (avoids browser CORS).
const baseURL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';

/**
 * Converts a stored image path (e.g. "images/abc.jpg") into a URL the browser
 * can actually fetch. In dev the Vite proxy handles /images → backend.
 * In production the backend base URL is prepended.
 */
export const getImageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${normalised}`;
};

const axiosClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosClient.interceptors.request.use(config => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

axiosClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      setToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
