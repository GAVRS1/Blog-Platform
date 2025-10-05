// src/services/follows.js
import api from '@/api/axios';

export const followsService = {
  follow: async (userId) => {
    const { data } = await api.post(`/follows/${userId}`);
    return data;
  },
  unfollow: async (userId) => {
    const { data } = await api.delete(`/follows/${userId}`);
    return data;
  },
  followers: async (userId, page = 1, pageSize = 20) => {
    const { data } = await api.get(`/follows/${userId}/followers`, { params: { page, pageSize } });
    return data; // { items,total,page,pageSize }
  },
  following: async (userId, page = 1, pageSize = 20) => {
    const { data } = await api.get(`/follows/${userId}/following`, { params: { page, pageSize } });
    return data; // { items,total,page,pageSize }
  },
  counters: async (userId) => {
    const { data } = await api.get(`/follows/${userId}/counters`);
    return data; // { followers, following }
  },
  relationship: async (otherUserId) => {
    const { data } = await api.get(`/follows/relationship/${otherUserId}`);
    return data;
  }
};