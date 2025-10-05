import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PUBLIC = ['/login', '/register', '/verify', '/appeal', '/404'];
let handling401 = false;

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      // не циклимся:
      if (!handling401) {
        handling401 = true;
        localStorage.removeItem('token');
        const path = window.location.pathname;
        const onPublic = PUBLIC.some(p => path.startsWith(p));
        // если мы И ТАК на публичной странице — ничего не делаем
        if (!onPublic) {
          window.location.replace('/login');
        }
        setTimeout(() => (handling401 = false), 1000);
      }
    } else if (status === 400) {
      console.error('Bad Request:', err.response?.data);
    }
    return Promise.reject(err);
  }
);

export default api;
