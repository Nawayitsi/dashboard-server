import { api } from './api';

export interface ApplicationItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  url?: string;
  category?: string;
  healthCheckUrl?: string;
  openIn?: 'SAME_TAB' | 'NEW_TAB' | 'EMBEDDED';
  isActive?: boolean;
  color?: string;
  order?: number;
  integrationId?: string;
}

export const applicationsApi = {
  findAll: async () => {
    const res = await api.get('/applications');
    return res.data.data;
  },
  findById: async (id: string) => {
    const res = await api.get(`/applications/${id}`);
    return res.data.data;
  },
  create: async (data: Partial<ApplicationItem>) => {
    const res = await api.post('/applications', data);
    return res.data.data;
  },
  update: async (id: string, data: Partial<ApplicationItem>) => {
    const res = await api.put(`/applications/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/applications/${id}`);
    return res.data.data;
  },
};
