// src/services/settings.js
import api from '@/api/axios';

export const settingsService = {
  getPrivacy: async () => {
    const { data } = await api.get('/settings/privacy');
    return data;
  },
  updatePrivacy: async (payload) => {
    const { data } = await api.put('/settings/privacy', payload);
    return data;
  },

  getNotifications: async () => {
    const { data } = await api.get('/settings/notifications');
    return data;
  },
  updateNotifications: async (payload) => {
    const { data } = await api.put('/settings/notifications', payload);
    return data;
  }
};