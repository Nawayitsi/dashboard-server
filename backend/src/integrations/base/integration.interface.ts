export interface IntegrationConnector {
  readonly name: string;
  readonly type: string;

  /** Initialize the connector with configuration */
  initialize(config: Record<string, any>): Promise<void>;

  /** Test connectivity to the service */
  testConnection(): Promise<{ success: boolean; message: string; latency?: number }>;

  /** Get the current status of the service */
  getStatus(): Promise<ServiceHealth>;

  /** Collect metrics from the service */
  collectMetrics(): Promise<MetricData[]>;

  /** Disconnect from the service */
  disconnect(): Promise<void>;
}

export interface ServiceHealth {
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  message?: string;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface MetricData {
  type: string;
  value: number;
  unit?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface IntegrationConfig {
  host?: string;
  port?: number;
  url?: string;
  username?: string;
  password?: string;
  apiToken?: string;
  [key: string]: any;
}
