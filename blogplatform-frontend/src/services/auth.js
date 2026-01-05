// src/services/auth.js
import api from '@/api/axios';
import { AUTH_TOKEN_COOKIE, removeCookie, setCookie } from '@/utils/cookies';

function persistToken(token) {
  if (!token) return;
  setCookie(AUTH_TOKEN_COOKIE, token, {
    sameSite: 'Lax',
    secure: undefined, // falls back to protocol check in cookies helper
    path: '/',
  });
}

export const authService = {
  /**
   * Регистрация по контракту OpenAPI:
   *  POST /api/Auth/register  (RegisterRequest)
   *  { email, password, username, fullName?, birthDate?, bio?, profilePictureUrl? }
   */
  async register(payload) {
    const { data } = await api.post('/Auth/register', payload);
    return data;
  },

  /**
   * Старт регистрации: отправляет код на email и возвращает временный ключ
   */
  async startRegister(email) {
    const { data } = await api.post('/Auth/register/start', { email });
    return data;
  },

  /**
   * Подтверждение email кодом из письма
   */
  async verifyEmail({ temporaryKey, code }) {
    const { data } = await api.post('/Auth/register/verify', { temporaryKey, code });
    return data;
  },

  /**
   * Завершение регистрации с профилем и паролем
   */
  async completeRegister(payload) {
    const { data } = await api.post('/Auth/register/complete', payload);
    if (data?.token) persistToken(data.token);
    return data;
  },

  /**
   * Повторная отправка кода подтверждения
   */
  async resendCode(temporaryKey) {
    const { data } = await api.post('/Auth/register/resend', { temporaryKey });
    return data;
  },

  /**
   * Логин по паре email/password
   */
  async login(email, password) {
    const { data } = await api.post('/Auth/login', { email, password });
    if (data?.token) persistToken(data.token);
    return data;
  },

  /**
   * Текущий пользователь
   */
  async me() {
    const { data } = await api.get('/Auth/me');
    return data;
  },

  logout() {
    removeCookie(AUTH_TOKEN_COOKIE, { path: '/' });
    window.location.href = '/login';
  },
};
