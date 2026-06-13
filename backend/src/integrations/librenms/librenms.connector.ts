import axios, { AxiosInstance } from 'axios';
import { IntegrationConnector, ServiceHealth, MetricData, IntegrationConfig, ConfigurationSchema } from '../base/integration.interface';
import { logger } from '../../utils/logger';

export class LibreNMSConnector implements IntegrationConnector {
  readonly name = 'LibreNMS';
  readonly type = 'LIBRENMS';
  private client: AxiosInstance | null = null;

  async initialize(config: IntegrationConfig): Promise<void> {
    this.client = axios.create({
      baseURL: `${config.url}/api/v0`,
      timeout: 10000,
      headers: { 'X-Auth-Token': config.apiToken || '' },
    });
    logger.info('LibreNMS connector initialized');
  }

  async testConnection() {
    if (!this.client) return { success: false, message: 'Not initialized' };
    const start = Date.now();
    try {
      const res = await this.client.get('/system');
      return { success: true, message: `LibreNMS v${res.data?.system?.[0]?.version || 'unknown'}`, latency: Date.now() - start };
    } catch (error: any) {
      return { success: false, message: error.message, latency: Date.now() - start };
    }
  }

  async getStatus(): Promise<ServiceHealth> {
    if (!this.client) return { status: 'unknown' };
    try {
      const start = Date.now();
      const res = await this.client.get('/devices?type=active');
      return { status: 'online', responseTime: Date.now() - start, details: { deviceCount: res.data?.devices?.length || 0 } };
    } catch { return { status: 'offline' }; }
  }

  async collectMetrics(): Promise<MetricData[]> {
    if (!this.client) return [];
    try {
      const res = await this.client.get('/devices');
      const devices = res.data?.devices || [];
      return [
        { type: 'CONNECTIONS', value: devices.length, unit: 'devices' },
        { type: 'CUSTOM', value: devices.filter((d: any) => d.status === 1).length, unit: 'online', metadata: { label: 'Online Devices' } },
      ];
    } catch (error: any) {
      logger.error('LibreNMS metrics failed:', error.message);
      return [];
    }
  }

  async disconnect(): Promise<void> { this.client = null; }

  configurationSchema(): ConfigurationSchema {
    return {
      fields: [
        { key: 'url', label: 'LibreNMS URL', type: 'url', placeholder: 'https://nms.example.com', required: true },
        { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your LibreNMS API token', required: true },
      ],
      widgets: [
        { id: 'librenms-devices', name: 'Device Count', description: 'Total monitored devices', category: 'NETWORK', renderer: 'MetricWidget' },
        { id: 'librenms-alerts', name: 'Active Alerts', description: 'LibreNMS alert notifications', category: 'SECURITY', renderer: 'AlertWidget' },
      ],
    };
  }
}

export const librenmsConnector = new LibreNMSConnector();
