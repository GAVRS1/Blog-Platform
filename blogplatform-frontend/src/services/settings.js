// src/services/settings.js
import api from '@/api/axios';

// Маппинг Audience: 0=Everyone, 1=FriendsOnly, 2=NoOne
const audienceFromApi = (value) => {
  if (typeof value === 'string') return value;
  if (value === 0) return 'Everyone';
  if (value === 1) return 'FriendsOnly';
  return 'NoOne';
};

const audienceToApi = (value) => {
  if (typeof value === 'string') return value;
  if (value === 0) return 'Everyone';
  if (value === 1) return 'FriendsOnly';
  return 'NoOne';
};

export const settingsService = {
  async getPrivacy() {
    const { data } = await api.get('/Settings/privacy');
    // API -> UI
    return {
      whoCanMessage: audienceFromApi(data.canMessageFrom),
      whoCanComment: audienceFromApi(data.canCommentFrom),
      whoCanViewProfile: audienceFromApi(data.profileVisibility),
      showActivity: !!data.showActivity,
      showEmail: !!data.showEmail,
    };
  },

  async updatePrivacy(p) {
    // UI -> API
    const payload = {
      canMessageFrom: audienceToApi(p.whoCanMessage),
      canCommentFrom: audienceToApi(p.whoCanComment),
      profileVisibility: audienceToApi(p.whoCanViewProfile),
      showActivity: !!p.showActivity,
      showEmail: !!p.showEmail,
    };
    const { data } = await api.put('/Settings/privacy', payload);
    // Вернём в UI-формате (чтобы не мигали селекты)
    return {
      whoCanMessage: audienceFromApi(data.canMessageFrom),
      whoCanComment: audienceFromApi(data.canCommentFrom),
      whoCanViewProfile: audienceFromApi(data.profileVisibility),
      showActivity: !!data.showActivity,
      showEmail: !!data.showEmail,
    };
  },

  async getNotifications() {
    const { data } = await api.get('/Settings/notifications');
    return {
      onLikes: !!data.onLikes,
      onComments: !!data.onComments,
      onFollows: !!data.onFollows,
      onMessages: !!data.onMessages,
    };
  },

  async updateNotifications(n) {
    const payload = {
      onLikes: !!n.onLikes,
      onComments: !!n.onComments,
      onFollows: !!n.onFollows,
      onMessages: !!n.onMessages,
    };
    const { data } = await api.put('/Settings/notifications', payload);
    return {
      onLikes: !!data.onLikes,
      onComments: !!data.onComments,
      onFollows: !!data.onFollows,
      onMessages: !!data.onMessages,
    };
  },
};
