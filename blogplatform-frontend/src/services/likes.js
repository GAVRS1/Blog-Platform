// src/services/likes.js
import api from '@/api/axios';

export const likesService = {
  togglePost: async (postId) => {
    const { data } = await api.post(`/likes/post/${postId}`);
    return data; // { liked, count }
  },
  toggleComment: async (commentId) => {
    const { data } = await api.post(`/likes/comment/${commentId}`);
    return data; // { liked, count }
  }
};