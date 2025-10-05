// src/services/admin.js
import api from '@/api/axios';

export const adminService = {
  // Reports
  createReport: async (payload) => {
    const { data } = await api.post('/admin/reports', payload);
    return data;
  },
  listReports: async (status, page = 1, pageSize = 20) => {
    const params = { page, pageSize };
    if (status) params.status = status;
    const { data } = await api.get('/admin/reports', { params });
    return data; // { items,total,page,pageSize }
  },

  // Actions
  createAction: async (payload) => {
    const { data } = await api.post('/admin/actions', payload);
    return data;
  },
  listActions: async (page = 1, pageSize = 20) => {
    const { data } = await api.get('/admin/actions', { params: { page, pageSize } });
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
    const { data } = await api.get('/admin/appeals', { params });
    return data; // { items,total,page,pageSize }
  },
  resolveAppeal: async (id, decision) => {
    const { data } = await api.post(`/admin/appeals/${id}/resolve`, { decision });
    return data; // { resolved: true }
  }
};