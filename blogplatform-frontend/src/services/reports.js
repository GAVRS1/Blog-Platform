// src/services/reports.js
import api from '@/api/axios';

/**
 * Пользователь подаёт жалобу. В API это /api/Admin/createReport
 */
export const reportsService = {
  /**
   * payload: { reason, targetUserId?, postId?, commentId?, details? }
   */
  async create(payload) {
    const { data } = await api.post('/Admin/createReport', payload);
    return data;
  },
};
