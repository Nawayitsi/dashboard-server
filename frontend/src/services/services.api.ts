import { api } from './api';

export const servicesApi = {
  findAll: async (page = 1, limit = 20) => {
    const res = await api.get(`/services?page=${page}&limit=${limit}`);
    return res.data;
  },
  getStatuses: async () => {
    const res = await api.get('/services/statuses');
    return res.data.data;
  },
  findById: async (id: string) => {
    const res = await api.get(`/services/${id}`);
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post('/services', data);
    return res.data.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/services/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/services/${id}`);
    return res.data.data;
  },
};
