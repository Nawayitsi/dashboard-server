import axios, { AxiosInstance } from 'axios';
import { IntegrationConnector, ServiceHealth, MetricData, IntegrationConfig } from '../base/integration.interface';
import { logger } from '../../utils/logger';

export class SafeLineConnector implements IntegrationConnector {
  readonly name = 'SafeLine WAF';
  readonly type = 'SAFELINE';
  private client: AxiosInstance | null = null;

  async initialize(config: IntegrationConfig): Promise<void> {
    this.client = axios.create({
      baseURL: `${config.url}/api`,
      timeout: 10000,
      headers: { Authorization: `Bearer ${config.apiToken || ''}` },
    });
    logger.info('SafeLine connector initialized');
  }

  async testConnection() {
    if (!this.client) return { success: false, message: 'Not initialized' };
    const start = Date.now();
    try {
      await this.client.get('/status');
      return { success: true, message: 'Connected to SafeLine', latency: Date.now() - start };
    } catch (error: any) {
      return { success: false, message: error.message, latency: Date.now() - start };
    }
  }

  async getStatus(): Promise<ServiceHealth> {
    if (!this.client) return { status: 'unknown' };
    try {
      const start = Date.now();
      await this.client.get('/status');
      return { status: 'online', responseTime: Date.now() - start };
    } catch { return { status: 'offline' }; }
  }

  async collectMetrics(): Promise<MetricData[]> {
    if (!this.client) return [];
    try {
      const [statsRes] = await Promise.all([
        this.client.get('/statistics'),
      ]);
      const stats = statsRes.data?.data || {};
      return [
        { type: 'CUSTOM', value: stats.blocked_requests || 0, unit: 'blocked', metadata: { label: 'Blocked Requests' } },
        { type: 'CUSTOM', value: stats.total_requests || 0, unit: 'total', metadata: { label: 'Total Requests' } },
        { type: 'CUSTOM', value: stats.attack_count || 0, unit: 'attacks', metadata: { label: 'Attacks Detected' } },
      ];
    } catch (error: any) {
      logger.error('SafeLine metrics failed:', error.message);
      return [];
    }
  }

  async disconnect(): Promise<void> { this.client = null; }
}

export const safelineConnector = new SafeLineConnector();
