// src/services/admin.js
import api from '@/api/axios';

export const adminService = {
  // Reports
  createReport: async (payload) => {
    const { data } = await api.post('/Admin/createReport', payload);
    return data;
  },
  listReports: async (status, page = 1, pageSize = 20) => {
    const params = { page, pageSize };
    if (status) params.status = status;
    const { data } = await api.get('/Admin/listReports', { params });
    return data; // { items,total,page,pageSize }
  },

  // Actions
  createAction: async (payload) => {
    const { data } = await api.post('/Admin/createAction', payload);
    return data;
  },
  listActions: async (page = 1, pageSize = 20) => {
    const { data } = await api.get('/Admin/listActions', { params: { page, pageSize } });
    return data;
  },

  // Appeals
  createAppeal: async (payload) => {
    const { data } = await api.post('/admin/appeals', payload);
    return data;
  },
  listAppeals: async (status, page = 1, pageSize = 20) => {
    const params = { page, pageSize };
    if (status) params.status = status;
    const { data } = await api.get('/Admin/listAppeals', { params });
    return data; // { items,total,page,pageSize }
  },
  resolveAppeal: async (id, decision) => {
    const { data } = await api.post('/Admin/resolveAppeal', { id, decision });
    return data; // { resolved: true }
  }
};
