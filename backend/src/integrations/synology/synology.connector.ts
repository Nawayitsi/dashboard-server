import axios, { AxiosInstance } from 'axios';
import { IntegrationConnector, ServiceHealth, MetricData, IntegrationConfig } from '../base/integration.interface';
import { logger } from '../../utils/logger';

export class SynologyConnector implements IntegrationConnector {
  readonly name = 'Synology DSM';
  readonly type = 'SYNOLOGY';
  private client: AxiosInstance | null = null;
  private sid: string | null = null;

  async initialize(config: IntegrationConfig): Promise<void> {
    this.client = axios.create({
      baseURL: `${config.url}/webapi`,
      timeout: 15000,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    });
    try {
      const res = await this.client.get('/auth.cgi', {
        params: { api: 'SYNO.API.Auth', version: 6, method: 'login', account: config.username, passwd: config.password, format: 'sid' },
      });
      if (res.data.success) this.sid = res.data.data.sid;
    } catch (error: any) {
      logger.error('Synology auth failed:', error.message);
    }
  }

  async testConnection() {
    if (!this.client) return { success: false, message: 'Not initialized' };
    const start = Date.now();
    try {
      const res = await this.client.get('/entry.cgi', {
        params: { api: 'SYNO.DSM.Info', version: 2, method: 'getinfo', _sid: this.sid },
      });
      return { success: res.data.success, message: res.data.success ? 'Connected' : 'Auth failed', latency: Date.now() - start };
    } catch (error: any) {
      return { success: false, message: error.message, latency: Date.now() - start };
    }
  }

  async getStatus(): Promise<ServiceHealth> {
    if (!this.client || !this.sid) return { status: 'unknown' };
    try {
      const start = Date.now();
      const res = await this.client.get('/entry.cgi', {
        params: { api: 'SYNO.DSM.Info', version: 2, method: 'getinfo', _sid: this.sid },
      });
      return { status: res.data.success ? 'online' : 'degraded', responseTime: Date.now() - start, details: res.data.data };
    } catch { return { status: 'offline' }; }
  }

  async collectMetrics(): Promise<MetricData[]> {
    if (!this.client || !this.sid) return [];
    try {
      const [sysRes, storageRes] = await Promise.all([
        this.client.get('/entry.cgi', { params: { api: 'SYNO.Core.System.Utilization', version: 1, method: 'get', _sid: this.sid } }),
        this.client.get('/entry.cgi', { params: { api: 'SYNO.Storage.CGI.Storage', version: 1, method: 'load_info', _sid: this.sid } }),
      ]);
      const metrics: MetricData[] = [];
      if (sysRes.data.success) {
        const cpu = sysRes.data.data.cpu;
        if (cpu) metrics.push({ type: 'CPU', value: cpu.user_load || 0, unit: '%' });
        const mem = sysRes.data.data.memory;
        if (mem) metrics.push({ type: 'MEMORY', value: Math.round((mem.real_usage || 0)), unit: '%' });
      }
      if (storageRes.data.success) {
        const volumes = storageRes.data.data.volumes || [];
        for (const vol of volumes) {
          const used = parseInt(vol.size?.used || '0');
          const total = parseInt(vol.size?.total || '1');
          metrics.push({ type: 'DISK', value: Math.round((used / total) * 100), unit: '%', metadata: { volume: vol.display_name } });
        }
      }
      return metrics;
    } catch (error: any) {
      logger.error('Synology metrics failed:', error.message);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.sid) {
      try { await this.client.get('/auth.cgi', { params: { api: 'SYNO.API.Auth', version: 6, method: 'logout', _sid: this.sid } }); } catch {}
    }
    this.client = null;
    this.sid = null;
  }
}

export const synologyConnector = new SynologyConnector();
