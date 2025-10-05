// src/services/reports.js
import api from '@/api/axios';

/**
 * Пользователь подаёт жалобы на контент/пользователей.
 * На бэке маршрут может быть /reports или /admin/reports — используем второй,
 * как у нас уже принято для списка/админки.
 */
export const reportsService = {
  /**
   * @param {{ reason:string, targetUserId?:number, postId?:number, commentId?:number, details?:string }} payload
   */
  create: async (payload) => {
    const { data } = await api.post('/admin/reports', payload);
    return data;
  }
};