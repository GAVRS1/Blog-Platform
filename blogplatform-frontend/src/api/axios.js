import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7141/api',
});

// всегда добавляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Токен отсутствует в localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// лог ответа 401 (без редиректа)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;