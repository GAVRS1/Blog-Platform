import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7141/api',
});

// Всегда добавляем токен из localStorage к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
