import prisma from '../../config/database';
import { MetricType } from '@prisma/client';

export class MetricsService {
  async query(params: { type?: MetricType; serviceId?: string; hours?: number; page?: number; limit?: number; }) {
    const { type, serviceId, hours = 24, page = 1, limit = 100 } = params;
    const since = new Date(Date.now() - hours * 3600000);
    const where: any = { recordedAt: { gte: since } };
    if (type) where.type = type;
    if (serviceId) where.serviceId = serviceId;

    const [metrics, total] = await Promise.all([
      prisma.metric.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { recordedAt: 'desc' },
        include: { service: { select: { name: true } } },
      }),
      prisma.metric.count({ where }),
    ]);
    return { metrics, total };
  }

  async getRealtime() {
    const since = new Date(Date.now() - 60000); // Last 60 seconds
    return prisma.metric.findMany({
      where: { recordedAt: { gte: since } },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async record(data: { serviceId?: string; type: MetricType; value: number; unit?: string; metadata?: any; }) {
    return prisma.metric.create({ data });
  }

  async recordBatch(metrics: Array<{ serviceId?: string; type: MetricType; value: number; unit?: string; }>) {
    return prisma.metric.createMany({ data: metrics });
  }

  async getAggregated(type: MetricType, hours = 24, intervalMinutes = 5) {
    const since = new Date(Date.now() - hours * 3600000);
    const metrics = await prisma.metric.findMany({
      where: { type, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { value: true, recordedAt: true },
    });

    // Group by interval
    const buckets: Record<string, number[]> = {};
    for (const m of metrics) {
      const bucket = new Date(Math.floor(m.recordedAt.getTime() / (intervalMinutes * 60000)) * intervalMinutes * 60000);
      const key = bucket.toISOString();
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(m.value);
    }

    return Object.entries(buckets).map(([time, values]) => ({
      time,
      avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
    }));
  }
}

export const metricsService = new MetricsService();
