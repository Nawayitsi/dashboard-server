import prisma from '../../config/database';
import { Severity } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

export class AlertsService {
  async findAll(params: { severity?: Severity; isResolved?: boolean; page?: number; limit?: number; }) {
    const { severity, isResolved, page = 1, limit = 20 } = params;
    const where: any = {};
    if (severity) where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { service: { select: { name: true, icon: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.alert.count({ where }),
    ]);
    return { alerts, total };
  }

  async create(data: { serviceId?: string; severity: Severity; title: string; message: string; source?: string; }) {
    return prisma.alert.create({ data });
  }

  async acknowledge(id: string) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new AppError('Alert not found', 404);
    return prisma.alert.update({ where: { id }, data: { acknowledgedAt: new Date() } });
  }

  async resolve(id: string) {
    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new AppError('Alert not found', 404);
    return prisma.alert.update({ where: { id }, data: { isResolved: true, resolvedAt: new Date() } });
  }

  async getStats() {
    const [total, critical, warning, info, resolved] = await Promise.all([
      prisma.alert.count({ where: { isResolved: false } }),
      prisma.alert.count({ where: { isResolved: false, severity: 'CRITICAL' } }),
      prisma.alert.count({ where: { isResolved: false, severity: 'WARNING' } }),
      prisma.alert.count({ where: { isResolved: false, severity: 'INFO' } }),
      prisma.alert.count({ where: { isResolved: true, resolvedAt: { gte: new Date(Date.now() - 86400000) } } }),
    ]);
    return { total, critical, warning, info, resolvedToday: resolved };
  }
}

export const alertsService = new AlertsService();
