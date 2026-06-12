import { api } from './api';

export const metricsApi = {
  query: async (params: { type?: string; serviceId?: string; hours?: number; page?: number; limit?: number }) => {
    const res = await api.get('/metrics', { params });
    return res.data;
  },
  getRealtime: async () => {
    const res = await api.get('/metrics/realtime');
    return res.data.data;
  },
  getAggregated: async (type: string, hours = 24, interval = 5) => {
    const res = await api.get(`/metrics/aggregated?type=${type}&hours=${hours}&interval=${interval}`);
    return res.data.data;
  },
};
