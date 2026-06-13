import prisma from '../../config/database';
import redis from '../../config/redis';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

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

  async getLayout(userId: string) {
    // 1. Get default dashboard
    let dashboard = await prisma.dashboard.findFirst({
      where: { isDefault: true },
      include: {
        widgets: {
          include: {
            widget: true,
          },
        },
      },
    });

    if (!dashboard) {
      dashboard = await prisma.dashboard.create({
        data: {
          id: 'default-dashboard',
          name: 'Main Dashboard',
          isDefault: true,
        },
        include: {
          widgets: {
            include: {
              widget: true,
            },
          },
        },
      });
    }

    // Auto-populate system widgets if empty
    if (dashboard.widgets.length === 0) {
      const defaultSystemWidgets = await prisma.widget.findMany({
        where: { id: { in: ['system-cpu', 'system-ram', 'system-disk'] } },
      });

      for (const w of defaultSystemWidgets) {
        await prisma.dashboardWidget.create({
          data: {
            dashboardId: dashboard.id,
            widgetId: w.id,
          },
        });
      }

      dashboard = await prisma.dashboard.findFirst({
        where: { id: dashboard.id },
        include: {
          widgets: {
            include: {
              widget: true,
            },
          },
        },
      }) as any;
    }

    if (!dashboard) {
      throw new AppError('Could not find or initialize dashboard', 500);
    }

    // 2. Fetch user's layouts
    const layouts = await prisma.widgetLayout.findMany({
      where: { userId, dashboardId: dashboard.id },
    });

    const layoutMap = new Map(layouts.map(l => [l.dashboardWidgetId, l]));

    // 3. Map dashboard widgets with layouts
    const widgetsWithLayout = dashboard.widgets.map((dw, index) => {
      const savedLayout = layoutMap.get(dw.id);
      const defaultLayout = {
        x: (index * 4) % 12,
        y: Math.floor(index / 3) * 4,
        w: 4,
        h: 4,
      };

      return {
        id: dw.id,
        widgetId: dw.widgetId,
        name: dw.title || dw.widget.name,
        description: dw.widget.description,
        category: dw.widget.category,
        dataSource: dw.widget.dataSource,
        renderer: dw.widget.renderer,
        config: dw.config,
        layout: savedLayout ? {
          x: savedLayout.x,
          y: savedLayout.y,
          w: savedLayout.w,
          h: savedLayout.h,
        } : defaultLayout,
      };
    });

    return {
      dashboardId: dashboard.id,
      widgets: widgetsWithLayout,
    };
  }

  async saveLayout(
    userId: string,
    dashboardId: string,
    layoutItems: Array<{
      dashboardWidgetId: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }>
  ) {
    for (const item of layoutItems) {
      await prisma.widgetLayout.upsert({
        where: {
          userId_dashboardWidgetId: {
            userId,
            dashboardWidgetId: item.dashboardWidgetId,
          },
        },
        update: {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        },
        create: {
          userId,
          dashboardId,
          dashboardWidgetId: item.dashboardWidgetId,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        },
      });
    }
  }

  async getAvailableWidgets() {
    return prisma.widget.findMany();
  }

  async addWidgetToDashboard(dashboardId: string, widgetId: string, title?: string, config?: any) {
    return prisma.dashboardWidget.create({
      data: {
        dashboardId,
        widgetId,
        title,
        config,
      },
    });
  }

  async removeWidgetFromDashboard(dashboardWidgetId: string) {
    return prisma.dashboardWidget.delete({
      where: { id: dashboardWidgetId },
    });
  }
}

export const dashboardService = new DashboardService();
