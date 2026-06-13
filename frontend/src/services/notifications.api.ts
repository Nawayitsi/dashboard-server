import { api } from './api';

export interface NotificationChannelItem {
  id: string;
  name: string;
  type: string; // TELEGRAM, DISCORD, SLACK, EMAIL, WEBHOOK
  config: Record<string, string>;
  isEnabled: boolean;
  templates?: any;
}

export const notificationChannelsApi = {
  getChannels: async () => {
    const res = await api.get('/notifications/channels/all');
    return res.data.data;
  },
  getChannelById: async (id: string) => {
    const res = await api.get(`/notifications/channels/${id}`);
    return res.data.data;
  },
  createChannel: async (data: Partial<NotificationChannelItem>) => {
    const res = await api.post('/notifications/channels', data);
    return res.data.data;
  },
  updateChannel: async (id: string, data: Partial<NotificationChannelItem>) => {
    const res = await api.put(`/notifications/channels/${id}`, data);
    return res.data.data;
  },
  deleteChannel: async (id: string) => {
    const res = await api.delete(`/notifications/channels/${id}`);
    return res.data.data;
  },
  testChannel: async (id: string) => {
    const res = await api.post(`/notifications/channels/${id}/test`);
    return res.data.data;
  },
};
