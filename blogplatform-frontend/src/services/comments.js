// src/services/comments.js
import api from '@/api/axios';

export const commentsService = {
  listByPost: async (postId, page = 1, pageSize = 10) => {
    const { data } = await api.get(`/comments/post/${postId}`, { params: { page, pageSize } });
    return data; // { items,total,page,pageSize }
  },

  create: async ({ postId, content }) => {
    const { data } = await api.post('/comments', { postId, content });
    return data; // created comment
  },

  reply: async (commentId, content) => {
    const { data } = await api.post(`/comments/${commentId}/reply`, { content });
    return data; // created reply
  },

  remove: async (id) => {
    const { data } = await api.delete(`/comments/${id}`);
    return data;
  },

  // Если у тебя есть отдельная выдача ответов — оставляем
  listReplies: async (commentId, page = 1, pageSize = 10) => {
    const { data } = await api.get(`/comments/${commentId}/replies`, { params: { page, pageSize } });
    return data; // { items,total,page,pageSize }
  }
};
