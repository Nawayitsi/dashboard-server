import axios, { AxiosInstance } from 'axios';
import { IntegrationConnector, ServiceHealth, MetricData, IntegrationConfig } from '../base/integration.interface';
import { logger } from '../../utils/logger';

export class MikroTikConnector implements IntegrationConnector {
  readonly name = 'MikroTik RouterOS';
  readonly type = 'MIKROTIK';
  private client: AxiosInstance | null = null;
  private config: IntegrationConfig = {};

  async initialize(config: IntegrationConfig): Promise<void> {
    this.config = config;
    this.client = axios.create({
      baseURL: `http://${config.host}:${config.port || 80}/rest`,
      auth: { username: config.username || '', password: config.password || '' },
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.info('MikroTik connector initialized');
  }

  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    if (!this.client) return { success: false, message: 'Not initialized' };
    const start = Date.now();
    try {
      await this.client.get('/system/identity');
      return { success: true, message: 'Connected to MikroTik', latency: Date.now() - start };
    } catch (error: any) {
      return { success: false, message: `Connection failed: ${error.message}`, latency: Date.now() - start };
    }
  }

  async getStatus(): Promise<ServiceHealth> {
    if (!this.client) return { status: 'unknown', message: 'Not initialized' };
    try {
      const start = Date.now();
      const res = await this.client.get('/system/resource');
      return {
        status: 'online',
        responseTime: Date.now() - start,
        details: Array.isArray(res.data) ? res.data[0] : res.data,
      };
    } catch {
      return { status: 'offline', message: 'Failed to reach MikroTik' };
    }
  }

  async collectMetrics(): Promise<MetricData[]> {
    if (!this.client) return [];
    try {
      const res = await this.client.get('/system/resource');
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      return [
        { type: 'CPU', value: parseInt(data['cpu-load'] || '0'), unit: '%' },
        { type: 'MEMORY', value: Math.round((1 - parseInt(data['free-memory'] || '0') / parseInt(data['total-memory'] || '1')) * 100), unit: '%' },
        { type: 'UPTIME', value: this.parseUptime(data['uptime'] || '0s'), unit: 'seconds' },
      ];
    } catch (error: any) {
      logger.error('MikroTik metrics collection failed:', error.message);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
  }

  private parseUptime(uptime: string): number {
    let seconds = 0;
    const weeks = uptime.match(/(\d+)w/);
    const days = uptime.match(/(\d+)d/);
    const hours = uptime.match(/(\d+)h/);
    const mins = uptime.match(/(\d+)m/);
    const secs = uptime.match(/(\d+)s/);
    if (weeks) seconds += parseInt(weeks[1]) * 604800;
    if (days) seconds += parseInt(days[1]) * 86400;
    if (hours) seconds += parseInt(hours[1]) * 3600;
    if (mins) seconds += parseInt(mins[1]) * 60;
    if (secs) seconds += parseInt(secs[1]);
    return seconds;
  }
}

export const mikrotikConnector = new MikroTikConnector();
