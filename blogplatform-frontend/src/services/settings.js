// src/services/settings.js
import api from '@/api/axios';

// Маппинг Audience: 0=Everyone, 1=FriendsOnly, 2=NoOne
const AtoS = (n) => (n === 0 ? 'Everyone' : n === 1 ? 'FriendsOnly' : 'NoOne');
const StoA = (s) => (s === 'Everyone' ? 0 : s === 'FriendsOnly' ? 1 : 2);

export const settingsService = {
  async getPrivacy() {
    const { data } = await api.get('/Settings/privacy');
    // API -> UI
    return {
      whoCanMessage: AtoS(data.canMessageFrom),
      whoCanComment: AtoS(data.canCommentFrom),
      whoCanViewProfile: AtoS(data.profileVisibility),
      showActivity: !!data.showActivity,
      showEmail: !!data.showEmail,
    };
  },

  async updatePrivacy(p) {
    // UI -> API
    const payload = {
      canMessageFrom: StoA(p.whoCanMessage),
      canCommentFrom: StoA(p.whoCanComment),
      profileVisibility: StoA(p.whoCanViewProfile),
      showActivity: !!p.showActivity,
      showEmail: !!p.showEmail,
    };
    const { data } = await api.put('/Settings/privacy', payload);
    // Вернём в UI-формате (чтобы не мигали селекты)
    return {
      whoCanMessage: AtoS(data.canMessageFrom),
      whoCanComment: AtoS(data.canCommentFrom),
      whoCanViewProfile: AtoS(data.profileVisibility),
      showActivity: !!data.showActivity,
      showEmail: !!data.showEmail,
    };
  },

  async getNotifications() {
    const { data } = await api.get('/Settings/notifications');
    return {
      onLikes: AtoS(data.onLikes),
      onComments: AtoS(data.onComments),
      onFollows: AtoS(data.onFollows),
      onMessages: AtoS(data.onMessages),
    };
  },

  async updateNotifications(n) {
    const payload = {
      onLikes: StoA(n.onLikes),
      onComments: StoA(n.onComments),
      onFollows: StoA(n.onFollows),
      onMessages: StoA(n.onMessages),
    };
    const { data } = await api.put('/Settings/notifications', payload);
    return {
      onLikes: AtoS(data.onLikes),
      onComments: AtoS(data.onComments),
      onFollows: AtoS(data.onFollows),
      onMessages: AtoS(data.onMessages),
    };
  },
};
