// src/services/users.js
import api from '@/api/axios';

export const usersService = {
  async getById(id) {
    const { data } = await api.get(`/Users/${id}`);
    return data; // UserDto
  },

  /**
   * counters: /api/Follows/{userId}/counters
   */
  async counters(userId) {
    const { data } = await api.get(`/Follows/${userId}/counters`);
    return data; // { followers, following }
  },

  /**
   * Обновление профиля
   * { fullName?, bio?, birthDate? }
   */
  async updateProfile(payload) {
    const { data } = await api.put('/Users/profile', payload);
    return data;
  },

  /**
   * Поиск пользователей для фронтовой проверки уникальности (username/email).
   * На бэке есть /api/Users/search?query=...
   */
  async search(query, page = 1, pageSize = 10) {
    const { data } = await api.get('/Users/search', { params: { query, page, pageSize } });
    return data; // { items,total,page,pageSize } | массив (если бэк так возвращает)
  },
};
