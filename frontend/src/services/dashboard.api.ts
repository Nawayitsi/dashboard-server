import { api } from './api';

export const dashboardApi = {
  getOverview: async () => {
    const res = await api.get('/dashboard');
    return res.data.data;
  },
  getSystemMetrics: async (hours = 24) => {
    const res = await api.get(`/dashboard/metrics?hours=${hours}`);
    return res.data.data;
  },
};
