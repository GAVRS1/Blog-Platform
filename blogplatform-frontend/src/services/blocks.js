// src/services/blocks.js
import api from '@/api/axios';

export const blocksService = {
  block: async (userId) => {
    const { data } = await api.post(`/blocks/${userId}`);
    return data; // { blocked: true }
  },
  unblock: async (userId) => {
    const { data } = await api.delete(`/blocks/${userId}`);
    return data; // { blocked: false }
  },
  list: async (page = 1, pageSize = 20) => {
    const { data } = await api.get('/blocks', { params: { page, pageSize } });
    return data; // { items:[{ id, username, profile }], total, page, pageSize }
  },
  relationship: async (otherUserId) => {
    const { data } = await api.get(`/blocks/relationship/${otherUserId}`);
    return data; // { iBlocked: boolean, blockedMe: boolean }
  }
};