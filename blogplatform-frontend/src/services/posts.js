// src/services/posts.js
import api from '@/api/axios';

export const postsService = {
  list: async ({ page = 1, pageSize = 10, feed } = {}) => {
    const params = { page, pageSize };
    if (feed) params.feed = feed;
    const { data } = await api.get('/posts', { params });
    return data; // { items,total,page,pageSize }
  },

  listByUser: async (userId, page = 1, pageSize = 10) => {
    // ожидается маршрут /posts/user/:userId с пагинацией
    const { data } = await api.get(`/posts/user/${userId}`, { params: { page, pageSize } });
    return data; // { items,total,page,pageSize }
  },

  getById: async (id) => {
    const { data } = await api.get(`/posts/${id}`);
    return data; // PostDetailDto
  },

  create: async (payload) => {
    // { content, attachments:[{url,type,mimeType,sizeBytes}] } — contentType вычисляется на сервере
    const { data } = await api.post('/posts', payload);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
  }
};
