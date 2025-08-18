// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
});

/* 1. Добавляем заголовок только если токен есть */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* 2. Обработка ответов */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { response, config } = err;

    /* 2.1 401 – токен недействителен/истёк → автоматический выход */
    if (response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    /* 2.2 400 на /users/me – токена нет, просто пробрасываем */
    if (response?.status === 400 && config?.url?.endsWith('/users/me')) {
      return Promise.reject(err);
    }

    /* 2.3 Все остальные ошибки */
    return Promise.reject(err);
  }
);

export default api;