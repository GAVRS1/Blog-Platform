// src/services/auth.js
import api from '@/api/axios';

export const authService = {
  // === ЛОГИН/ЛОГАУТ/ПРОФИЛЬ ===
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data?.token) localStorage.setItem('token', data.token);
    return data.user;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // === НОВЫЙ РЕГ-ФЛОУ С ПОДТВЕРЖДЕНИЕМ ПО ПОЧТЕ ===
  /**
   * Шаг 1: запросить код на email
   * @param {string} email
   * @returns {{ ok: boolean }}
   */
  async requestEmailCode(email) {
    const { data } = await api.post('/auth/request-email-code', { email });
    return data; // { ok: true }
  },

  /**
   * Шаг 2: подтвердить email кодом
   * @param {string} email
   * @param {string} code
   * @returns {{ verified: boolean }}
   */
  async verifyEmailCode(email, code) {
    const { data } = await api.post('/auth/verify-email-code', { email, code });
    return data; // { verified: true }
  },

  /**
   * Шаг 3: завершить регистрацию, опционально вернётся token
   * @param {{email:string, password:string, username:string, fullName?:string, birthDate?:string, bio?:string, profilePictureUrl?:string}} payload
   * @returns {{ id:number, username:string, email:string } | { token:string, user:object }}
   */
  async completeRegistration(payload) {
    const { data } = await api.post('/auth/complete-registration', payload);

    // Бэкенд может вернуть token сразу. Если да — сохраним.
    if (data?.token) {
      localStorage.setItem('token', data.token);
      return data.user;
    }
    return data; // { id, username, email } — тогда фронт решает, логиниться ли сразу
  }
};
