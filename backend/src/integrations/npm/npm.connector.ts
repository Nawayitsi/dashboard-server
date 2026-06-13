import axios, { AxiosInstance } from 'axios';
import { IntegrationConnector, ServiceHealth, MetricData, IntegrationConfig, ConfigurationSchema } from '../base/integration.interface';
import { logger } from '../../utils/logger';

export class NginxProxyManagerConnector implements IntegrationConnector {
  readonly name = 'Nginx Proxy Manager';
  readonly type = 'NGINX_PROXY_MANAGER';
  private client: AxiosInstance | null = null;
  private token: string | null = null;

  async initialize(config: IntegrationConfig): Promise<void> {
    this.client = axios.create({
      baseURL: `${config.url}/api`,
      timeout: 10000,
    });
    // Authenticate and get a token
    try {
      const res = await this.client.post('/tokens', {
        identity: config.email || config.username || '',
        secret: config.password || '',
      });
      this.token = res.data?.token;
      if (this.token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    } catch (error: any) {
      logger.error('NPM auth failed:', error.message);
    }
    logger.info('Nginx Proxy Manager connector initialized');
  }

  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    if (!this.client) return { success: false, message: 'Not initialized' };
    const start = Date.now();
    try {
      await this.client.get('/nginx/proxy-hosts');
      return { success: true, message: 'Connected to Nginx Proxy Manager', latency: Date.now() - start };
    } catch (error: any) {
      return { success: false, message: `Connection failed: ${error.message}`, latency: Date.now() - start };
    }
  }

  async getStatus(): Promise<ServiceHealth> {
    if (!this.client) return { status: 'unknown', message: 'Not initialized' };
    try {
      const start = Date.now();
      await this.client.get('/nginx/proxy-hosts');
      return { status: 'online', responseTime: Date.now() - start };
    } catch {
      return { status: 'offline', message: 'Failed to reach NPM' };
    }
  }

  async collectMetrics(): Promise<MetricData[]> {
    if (!this.client) return [];
    try {
      const [proxyRes, redirectRes, streamsRes] = await Promise.all([
        this.client.get('/nginx/proxy-hosts').catch(() => ({ data: [] })),
        this.client.get('/nginx/redirection-hosts').catch(() => ({ data: [] })),
        this.client.get('/nginx/streams').catch(() => ({ data: [] })),
      ]);

      return [
        { type: 'CUSTOM', value: (proxyRes.data || []).length, unit: 'hosts', metadata: { label: 'Proxy Hosts' } },
        { type: 'CUSTOM', value: (redirectRes.data || []).length, unit: 'redirects', metadata: { label: 'Redirection Hosts' } },
        { type: 'CUSTOM', value: (streamsRes.data || []).length, unit: 'streams', metadata: { label: 'TCP/UDP Streams' } },
      ];
    } catch (error: any) {
      logger.error('NPM metrics collection failed:', error.message);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.token = null;
  }

  configurationSchema(): ConfigurationSchema {
    return {
      fields: [
        { key: 'url', label: 'NPM URL', type: 'url', placeholder: 'http://npm.local:81', required: true },
        { key: 'email', label: 'Admin Email', type: 'text', placeholder: 'admin@example.com', required: true },
        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
      ],
      widgets: [
        { id: 'npm-proxies', name: 'Proxy Hosts', description: 'Number of active reverse proxy hosts', category: 'NETWORK', renderer: 'MetricWidget' },
        { id: 'npm-certs', name: 'SSL Certificates', description: 'SSL/TLS certificate status', category: 'SECURITY', renderer: 'MetricWidget' },
      ],
    };
  }
}

export const npmConnector = new NginxProxyManagerConnector();
