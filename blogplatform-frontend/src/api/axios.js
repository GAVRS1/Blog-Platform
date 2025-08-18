import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (err.response?.status === 400) {
      console.error('Bad Request:', err.response.data);
    }
    return Promise.reject(err);
  }
);

export default api;