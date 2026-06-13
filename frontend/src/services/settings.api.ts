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
  getAppearance: async () => {
    const res = await api.get('/settings/appearance');
    return res.data.data;
  },
  updateAppearance: async (data: Record<string, string>) => {
    const res = await api.put('/settings/appearance', data);
    return res.data.data;
  },
};

export const integrationsApi = {
  findAll: async () => {
    const res = await api.get('/integrations');
    return res.data.data;
  },
  findById: async (id: string) => {
    const res = await api.get(`/integrations/${id}`);
    return res.data.data;
  },
  update: async (id: string, data: { config?: Record<string, any>; isEnabled?: boolean; name?: string }) => {
    const res = await api.put(`/integrations/${id}`, data);
    return res.data.data;
  },
  saveCredentials: async (id: string, credentials: Record<string, string>) => {
    const res = await api.put(`/integrations/${id}/credentials`, { credentials });
    return res.data.data;
  },
  getCredentials: async (id: string) => {
    const res = await api.get(`/integrations/${id}/credentials`);
    return res.data.data;
  },
  getSchema: async (id: string) => {
    const res = await api.get(`/integrations/${id}/schema`);
    return res.data.data;
  },
  getAllSchemas: async () => {
    const res = await api.get('/integrations/schemas/all');
    return res.data.data;
  },
  test: async (id: string) => {
    const res = await api.post(`/integrations/${id}/test`);
    return res.data.data;
  },
  sync: async (id: string) => {
    const res = await api.post(`/integrations/${id}/sync`);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/integrations/${id}`);
    return res.data.data;
  },
};
