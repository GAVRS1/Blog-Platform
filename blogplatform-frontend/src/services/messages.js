// src/services/messages.js
import api from '@/api/axios';

export const messagesService = {
  getInbox: async () => {
    const { data } = await api.get('/messages/inbox');
    return data; // [{ otherUserId, lastMessage, unreadCount }]
  },

  getDialog: async (otherUserId, page = 1, pageSize = 30) => {
    const { data } = await api.get(`/messages/dialog/${otherUserId}`, { params: { page, pageSize } });
    return data; // Message[]
  },

  send: async ({ recipientId, content, attachments }) => {
    const { data } = await api.post('/messages', { recipientId, content, attachments });
    return data; // Message
  },

  markRead: async (otherUserId) => {
    const { data } = await api.post(`/messages/read/${otherUserId}`);
    return data; // { marked, updatedMessages }
  }
};
