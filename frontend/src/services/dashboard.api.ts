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
  getLayout: async () => {
    const res = await api.get('/dashboard/layout');
    return res.data.data;
  },
  saveLayout: async (dashboardId: string, layout: any[]) => {
    const res = await api.post('/dashboard/layout', { dashboardId, layout });
    return res.data.data;
  },
  getAvailableWidgets: async () => {
    const res = await api.get('/dashboard/widgets/available');
    return res.data.data;
  },
  addWidget: async (data: { dashboardId: string; widgetId: string; title?: string; config?: any }) => {
    const res = await api.post('/dashboard/widgets', data);
    return res.data.data;
  },
  removeWidget: async (dashboardWidgetId: string) => {
    const res = await api.delete(`/dashboard/widgets/${dashboardWidgetId}`);
    return res.data.data;
  },
};
