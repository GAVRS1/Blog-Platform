// src/services/notifications.js
import api from '@/api/axios';

export const notificationsService = {
  list: async (page = 1, pageSize = 20) => {
    const { data } = await api.get('/notifications', { params: { page, pageSize } });
    return data; // UserNotificationDto[]
  },
  unreadCount: async () => {
    const { data } = await api.get('/notifications/unread');
    return data; // { unread: N }
  },
  markAllRead: async () => {
    const { data } = await api.post('/notifications/read/all');
    return data; // { marked: N }
  },
  markRead: async (id) => {
    const { data } = await api.post(`/notifications/read/${id}`);
    return data; // { marked: 1 }
  }
};