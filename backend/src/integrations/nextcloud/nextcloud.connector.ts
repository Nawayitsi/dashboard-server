import axios, { AxiosInstance } from 'axios';
import { IntegrationConnector, ServiceHealth, MetricData, IntegrationConfig } from '../base/integration.interface';
import { logger } from '../../utils/logger';

export class NextcloudConnector implements IntegrationConnector {
  readonly name = 'Nextcloud';
  readonly type = 'NEXTCLOUD';
  private client: AxiosInstance | null = null;

  async initialize(config: IntegrationConfig): Promise<void> {
    this.client = axios.create({
      baseURL: `${config.url}/ocs/v2.php`,
      auth: { username: config.username || '', password: config.password || '' },
      timeout: 10000,
      headers: { 'OCS-APIREQUEST': 'true', Accept: 'application/json' },
    });
    logger.info('Nextcloud connector initialized');
  }

  async testConnection() {
    if (!this.client) return { success: false, message: 'Not initialized' };
    const start = Date.now();
    try {
      await this.client.get('/cloud/capabilities');
      return { success: true, message: 'Connected to Nextcloud', latency: Date.now() - start };
    } catch (error: any) {
      return { success: false, message: error.message, latency: Date.now() - start };
    }
  }

  async getStatus(): Promise<ServiceHealth> {
    if (!this.client) return { status: 'unknown' };
    try {
      const start = Date.now();
      await this.client.get('/cloud/capabilities');
      return { status: 'online', responseTime: Date.now() - start };
    } catch { return { status: 'offline' }; }
  }

  async collectMetrics(): Promise<MetricData[]> {
    if (!this.client) return [];
    try {
      const res = await this.client.get('/apps/serverinfo/api/v1/info');
      const info = res.data?.ocs?.data?.server;
      if (!info) return [];
      return [
        { type: 'CPU', value: info.webserver?.system?.cpus || 0, unit: 'cores', metadata: { source: 'nextcloud' } },
        { type: 'MEMORY', value: Math.round((info.php?.memory_limit || 0) / 1048576), unit: 'MB' },
        { type: 'DISK', value: Math.round((info.database?.size || 0) / 1073741824), unit: 'GB', metadata: { label: 'DB Size' } },
      ];
    } catch (error: any) {
      logger.error('Nextcloud metrics failed:', error.message);
      return [];
    }
  }

  async disconnect(): Promise<void> { this.client = null; }
}

export const nextcloudConnector = new NextcloudConnector();
