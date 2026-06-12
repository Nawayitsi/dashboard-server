import axios, { AxiosInstance } from 'axios';
import { IntegrationConnector, ServiceHealth, MetricData, IntegrationConfig } from '../base/integration.interface';
import { logger } from '../../utils/logger';

export class SIEMConnector implements IntegrationConnector {
  readonly name = 'SIEM Platform';
  readonly type = 'SIEM';
  private client: AxiosInstance | null = null;

  async initialize(config: IntegrationConfig): Promise<void> {
    this.client = axios.create({
      baseURL: `${config.url}/api`,
      timeout: 10000,
      headers: { Authorization: `Bearer ${config.apiToken || ''}` },
    });
    logger.info('SIEM connector initialized');
  }

  async testConnection() {
    if (!this.client) return { success: false, message: 'Not initialized' };
    const start = Date.now();
    try {
      await this.client.get('/health');
      return { success: true, message: 'Connected to SIEM', latency: Date.now() - start };
    } catch (error: any) {
      return { success: false, message: error.message, latency: Date.now() - start };
    }
  }

  async getStatus(): Promise<ServiceHealth> {
    if (!this.client) return { status: 'unknown' };
    try {
      const start = Date.now();
      await this.client.get('/health');
      return { status: 'online', responseTime: Date.now() - start };
    } catch { return { status: 'offline' }; }
  }

  async collectMetrics(): Promise<MetricData[]> {
    if (!this.client) return [];
    try {
      const res = await this.client.get('/events/stats');
      const stats = res.data || {};
      return [
        { type: 'CUSTOM', value: stats.total_events || 0, unit: 'events', metadata: { label: 'Total Events' } },
        { type: 'CUSTOM', value: stats.active_incidents || 0, unit: 'incidents', metadata: { label: 'Active Incidents' } },
        { type: 'CUSTOM', value: stats.threats_detected || 0, unit: 'threats', metadata: { label: 'Threats Detected' } },
      ];
    } catch (error: any) {
      logger.error('SIEM metrics failed:', error.message);
      return [];
    }
  }

  async disconnect(): Promise<void> { this.client = null; }
}

export const siemConnector = new SIEMConnector();
