import { api } from './api';

export const settingsApi = {
  findAll: async (group?: string) => {
    const res = await api.get('/settings', { params: { group } });
    return res.data.data;
  },
  update: async (data: { settings?: Array<{ key: string; value: any; group?: string }>; key?: string; value?: any; group?: string }) => {
    const res = await api.put('/settings', data);
    return res.data.data;
  },
};
export const integrationsApi = {
  findAll: async () => {
    const res = await api.get('/integrations');
    return res.data.data;
  },
  update: async (id: string, data: { config?: Record<string, any>; isEnabled?: boolean }) => {
    const res = await api.put(`/integrations/${id}`, data);
    return res.data.data;
  },
  test: async (id: string) => {
    const res = await api.post(`/integrations/${id}/test`);
    return res.data.data;
  },
};
