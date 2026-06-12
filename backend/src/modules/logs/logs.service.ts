import prisma from '../../config/database';
import { LogLevel } from '@prisma/client';

export class LogsService {
  async findAll(params: { level?: LogLevel; source?: string; serviceId?: string; search?: string; page?: number; limit?: number; hours?: number; }) {
    const { level, source, serviceId, search, page = 1, limit = 50, hours = 24 } = params;
    const since = new Date(Date.now() - hours * 3600000);
    const where: any = { timestamp: { gte: since } };
    if (level) where.level = level;
    if (source) where.source = source;
    if (serviceId) where.serviceId = serviceId;
    if (search) where.message = { contains: search };

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { service: { select: { name: true } } },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.log.count({ where }),
    ]);
    return { logs, total };
  }

  async create(data: { serviceId?: string; level: LogLevel; source: string; message: string; metadata?: any; }) {
    return prisma.log.create({ data });
  }

  async getSources() {
    const sources = await prisma.log.findMany({
      distinct: ['source'],
      select: { source: true },
    });
    return sources.map(s => s.source);
  }
}

export const logsService = new LogsService();
