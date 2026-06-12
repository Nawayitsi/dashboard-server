import { api } from './api';

export const alertsApi = {
  findAll: async (params: { severity?: string; isResolved?: boolean; page?: number; limit?: number }) => {
    const res = await api.get('/alerts', { params });
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/alerts/stats');
    return res.data.data;
  },
  acknowledge: async (id: string) => {
    const res = await api.put(`/alerts/${id}/acknowledge`);
    return res.data.data;
  },
  resolve: async (id: string) => {
    const res = await api.put(`/alerts/${id}/resolve`);
    return res.data.data;
  },
};
