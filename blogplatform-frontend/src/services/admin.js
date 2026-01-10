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
  resolveReport: async (reportId, status) => {
    const { data } = await api.post('/Admin/resolveReport', { reportId, status });
    return data;
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
  listAppeals: async (status, page = 1, pageSize = 20) => {
    const params = { page, pageSize };
    if (status) params.status = status;
    const { data } = await api.get('/Admin/listAppeals', { params });
    return data; // { items,total,page,pageSize }
  },
  resolveAppeal: async (appealId, status, resolution) => {
    const { data } = await api.post('/Admin/resolveAppeal', { appealId, status, resolution });
    return data; // { resolved: true }
  }
};
