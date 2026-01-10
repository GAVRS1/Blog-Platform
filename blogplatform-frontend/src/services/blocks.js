// src/services/blocks.js
import api from '@/api/axios';

export const blocksService = {
  block: async (userId, reason) => {
    const { data } = await api.post('/blocks/block', {
      targetUserId: userId,
      ...(reason ? { reason } : {})
    });
    return data; // { blocked: true }
  },
  unblock: async (userId) => {
    const { data } = await api.post('/blocks/unblock', { targetUserId: userId });
    return data; // { blocked: false }
  },
  list: async () => {
    const { data } = await api.get('/blocks/list');
    return data; // BlockDto[]
  },
  relationship: async (otherUserId) => {
    const { data } = await api.get(`/blocks/relationship/${otherUserId}`);
    return data; // { iBlocked: boolean, blockedMe: boolean }
  }
};
