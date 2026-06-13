import { api } from './api';

export interface AutomationRuleItem {
  id: string;
  name: string;
  description?: string;
  triggerType: 'METRIC_THRESHOLD' | 'SERVICE_STATUS';
  triggerConfig: {
    metric?: 'CPU' | 'MEMORY' | 'DISK';
    operator?: '>' | '<' | '==';
    value?: number | string;
    serviceId?: string;
    status?: string;
  };
  actionType: 'SEND_NOTIFICATION' | 'CREATE_ALERT';
  actionConfig: {
    channelId?: string;
    template?: string;
    severity?: 'CRITICAL' | 'WARNING' | 'INFO';
    title?: string;
    message?: string;
  };
  isEnabled: boolean;
  lastTriggeredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const automationApi = {
  getRules: async (): Promise<AutomationRuleItem[]> => {
    const res = await api.get('/automation');
    return res.data.data;
  },
  getRuleById: async (id: string): Promise<AutomationRuleItem> => {
    const res = await api.get(`/automation/${id}`);
    return res.data.data;
  },
  createRule: async (data: Partial<AutomationRuleItem>): Promise<AutomationRuleItem> => {
    const res = await api.post('/automation', data);
    return res.data.data;
  },
  updateRule: async (id: string, data: Partial<AutomationRuleItem>): Promise<AutomationRuleItem> => {
    const res = await api.put(`/automation/${id}`, data);
    return res.data.data;
  },
  deleteRule: async (id: string): Promise<any> => {
    const res = await api.delete(`/automation/${id}`);
    return res.data.data;
  },
};
