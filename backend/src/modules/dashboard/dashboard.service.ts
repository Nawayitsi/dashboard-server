import prisma from '../../config/database';
import redis from '../../config/redis';
import { logger } from '../../utils/logger';

export class DashboardService {
  private CACHE_KEY = 'dashboard:overview';
  private CACHE_TTL = 10; // 10 seconds

  async getOverview() {
    // Try cache first
    try {
      const cached = await redis.get(this.CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      logger.warn('Redis cache miss for dashboard');
    }

    const [
      totalServices,
      onlineServices,
      activeAlerts,
      criticalAlerts,
      recentMetrics,
      recentLogs,
      unreadNotifications,
    ] = await Promise.all([
      prisma.service.count({ where: { isActive: true } }),
      prisma.serviceStatus.count({
        where: { status: 'ONLINE' },
      }),
      prisma.alert.count({ where: { isResolved: false } }),
      prisma.alert.count({ where: { isResolved: false, severity: 'CRITICAL' } }),
      prisma.metric.findMany({
        where: { recordedAt: { gte: new Date(Date.now() - 60000) } },
        orderBy: { recordedAt: 'desc' },
        take: 50,
      }),
      prisma.log.count({
        where: { timestamp: { gte: new Date(Date.now() - 3600000) } },
      }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    // Aggregate metrics by type
    const latestMetrics = this.aggregateMetrics(recentMetrics);

    const overview = {
      services: { total: totalServices, online: onlineServices, offline: totalServices - onlineServices },
      alerts: { total: activeAlerts, critical: criticalAlerts },
      metrics: latestMetrics,
      logsLastHour: recentLogs,
      unreadNotifications,
      lastUpdated: new Date().toISOString(),
    };

    // Cache result
    try {
      await redis.setex(this.CACHE_KEY, this.CACHE_TTL, JSON.stringify(overview));
    } catch (e) {
      logger.warn('Redis cache set failed');
    }

    return overview;
  }

  async getSystemMetrics(hours = 24) {
    const since = new Date(Date.now() - hours * 3600000);
    const metrics = await prisma.metric.findMany({
      where: { recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { type: true, value: true, unit: true, recordedAt: true },
    });
    return metrics;
  }

  private aggregateMetrics(metrics: any[]) {
    const grouped: Record<string, { latest: number; avg: number; count: number }> = {};
    for (const m of metrics) {
      if (!grouped[m.type]) {
        grouped[m.type] = { latest: m.value, avg: 0, count: 0 };
      }
      grouped[m.type].avg += m.value;
      grouped[m.type].count += 1;
    }
    for (const key of Object.keys(grouped)) {
      grouped[key].avg = Math.round((grouped[key].avg / grouped[key].count) * 100) / 100;
    }
    return grouped;
  }
}

export const dashboardService = new DashboardService();
