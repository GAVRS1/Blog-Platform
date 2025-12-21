// src/api/axios.js
import axios from 'axios';
import { API_BASE, API_PREFIX } from './config';

const baseURL = API_BASE ? `${API_BASE}${API_PREFIX}` : API_PREFIX;

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
    const token = localStorage.getItem('token');
    const isPublicPath = ['/login', '/register', '/verify', '/appeal'].some((p) =>
      location.pathname.startsWith(p)
    );

    // Если токена нет, не дергаем редирект (это важно для публичных страниц,
    // вроде регистрации, где 401 на вспомогательных запросах не должен сбрасывать форму).
    if (status === 401 && token) {
      // Токен невалиден — почистим и отправим на логин, если мы не на публичном маршруте
      localStorage.removeItem('token');
      if (!isPublicPath && !location.pathname.startsWith('/login')) {
        location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
