import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 60000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('documind_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors + auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('documind_token');
      localStorage.removeItem('documind_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    const message = err.response?.data?.message || err.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
