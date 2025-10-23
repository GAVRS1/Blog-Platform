// src/services/auth.js
import api from '@/api/axios';

export const authService = {
  /**
   * Регистрация. Бэкенд по OpenAPI ожидает RegisterRequest:
   * { email, password, username, fullName?, birthDate?, bio?, profilePictureUrl? }
   * Если на бэке включено письмо-подтверждение — оно уйдёт из /register.
   */
  async register(payload) {
    const { data } = await api.post('/Auth/register', payload);
    // Бэкенд может вернуть пользователя, либо просто 200 — считаем успехом
    return data;
  },

  /**
   * Логин
   */
  async login(email, password) {
    const { data } = await api.post('/Auth/login', { email, password });
    // Если бэкенд вернёт token — сохраним (в OpenAPI токен не описан, но на случай)
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  /**
   * Профиль текущего пользователя
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
