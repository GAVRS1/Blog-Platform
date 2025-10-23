// src/services/auth.js
import api from '@/api/axios';

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
   * Логин по паре email/password
   */
  async login(email, password) {
    const { data } = await api.post('/Auth/login', { email, password });
    if (data?.token) localStorage.setItem('token', data.token);
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
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
