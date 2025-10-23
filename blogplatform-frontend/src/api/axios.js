// src/api/axios.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, '') || '';
// Если в VITE_API_BASE уже есть /api, не добавляем повторно
const baseURL = /\/api\/?$/i.test(API_BASE) ? API_BASE : `${API_BASE}/api`;

const api = axios.create({
  baseURL,
  withCredentials: false, // если используешь куки -> true и настроить CORS на бэке
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Токен невалиден — почистим и отправим на логин
      localStorage.removeItem('token');
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
