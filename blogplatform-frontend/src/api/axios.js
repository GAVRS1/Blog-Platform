// src/api/axios.js
import axios from 'axios';
import { API_BASE, API_PREFIX } from './config';
import { AUTH_TOKEN_COOKIE, getCookie, removeCookie } from '@/utils/cookies';
import { getConsentState } from '@/hooks/useCookieConsent';

const baseURL = API_BASE ? `${API_BASE}${API_PREFIX}` : API_PREFIX;

const api = axios.create({
  baseURL,
  withCredentials: true, // для httpOnly/secure cookies; настрой CORS на бэке
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (getConsentState() === 'declined') {
    return Promise.reject(new Error('Cookie consent declined'));
  }
  const token = getCookie(AUTH_TOKEN_COOKIE);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const errorCode = error?.response?.data?.code;
    const isPublicPath = ['/login', '/register', '/verify', '/appeal', '/blocked'].some((p) =>
      location.pathname.startsWith(p)
    );

    if (status === 403 && errorCode === 'AccountBlocked') {
      if (!location.pathname.startsWith('/blocked')) {
        location.href = '/blocked';
      }
      return Promise.reject(error);
    }

    if (status === 401) {
      // Токен невалиден — почистим и отправим на логин, если мы не на публичном маршруте
      removeCookie(AUTH_TOKEN_COOKIE, { path: '/' });
      if (!isPublicPath && !location.pathname.startsWith('/login')) {
        location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
