import axios from 'axios';

// Token stored in memory (never localStorage)
let _token: string | null = null;

export const setToken = (token: string | null) => { _token = token; };
export const getToken = () => _token;

// In dev, use same-origin `/api/*` so Vite proxies to the backend (avoids browser CORS).
const baseURL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';

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
