import { IntegrationConnector } from './integration.interface';
import { logger } from '../../utils/logger';

class IntegrationRegistry {
  private connectors = new Map<string, IntegrationConnector>();

  register(connector: IntegrationConnector): void {
    this.connectors.set(connector.type, connector);
    logger.info(`📦 Integration registered: ${connector.name} [${connector.type}]`);
  }

  get(type: string): IntegrationConnector | undefined {
    return this.connectors.get(type);
  }

  getAll(): IntegrationConnector[] {
    return Array.from(this.connectors.values());
  }

  has(type: string): boolean {
    return this.connectors.has(type);
  }

  async testAll(): Promise<Record<string, { success: boolean; message: string }>> {
    const results: Record<string, { success: boolean; message: string }> = {};
    for (const [type, connector] of this.connectors) {
      try {
        results[type] = await connector.testConnection();
      } catch (error: any) {
        results[type] = { success: false, message: error.message };
      }
    }
    return results;
  }

  async collectAllMetrics() {
    const allMetrics = [];
    for (const [type, connector] of this.connectors) {
      try {
        const metrics = await connector.collectMetrics();
        allMetrics.push(...metrics.map(m => ({ ...m, source: type })));
      } catch (error: any) {
        logger.error(`Failed to collect metrics from ${type}:`, error.message);
      }
    }
    return allMetrics;
  }
}

export const integrationRegistry = new IntegrationRegistry();
