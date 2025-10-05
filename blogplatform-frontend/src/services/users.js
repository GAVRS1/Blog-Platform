// src/services/users.js
import api from '@/api/axios';

export const usersService = {
  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data; // UserDto
  },

  updateProfile: async (payload) => {
    // { fullName?, bio?, birthDate?, profilePictureUrl? }
    const { data } = await api.put('/users/profile', payload);
    return data; // updated UserDto
  },

  counters: async (userId) => {
    const { data } = await api.get(`/follows/${userId}/counters`);
    return data; // { followers, following }
  }
};