// src/services/appeals.js
import api from '@/api/axios';

export const appealsService = {
  getBlockStatus: async () => {
    const { data } = await api.get('/Appeals/block-status');
    return data;
  },
  create: async (message) => {
    const { data } = await api.post('/Appeals', { message });
    return data;
  },
};
