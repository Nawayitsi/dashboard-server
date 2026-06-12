import { api } from './api';

export const logsApi = {
  findAll: async (params: { level?: string; source?: string; serviceId?: string; search?: string; page?: number; limit?: number; hours?: number }) => {
    const res = await api.get('/logs', { params });
    return res.data;
  },
  getSources: async () => {
    const res = await api.get('/logs/sources');
    return res.data.data;
  },
};
