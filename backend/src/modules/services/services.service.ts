import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { ServiceType } from '@prisma/client';

export class ServicesService {
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        skip, take: limit,
        include: {
          statuses: { orderBy: { checkedAt: 'desc' }, take: 1 },
        },
        orderBy: { order: 'asc' },
      }),
      prisma.service.count(),
    ]);
    return { services, total };
  }

  async findById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        statuses: { orderBy: { checkedAt: 'desc' }, take: 10 },
        metrics: { orderBy: { recordedAt: 'desc' }, take: 20 },
        alerts: { where: { isResolved: false }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!service) throw new AppError('Service not found', 404);
    return service;
  }

  async create(data: { name: string; type: ServiceType; description?: string; url?: string; icon?: string; color?: string; }) {
    return prisma.service.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; type: ServiceType; description: string; url: string; icon: string; color: string; isActive: boolean; order: number; }>) {
    await this.findById(id);
    return prisma.service.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.service.delete({ where: { id } });
  }

  async updateStatus(id: string, status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'MAINTENANCE', responseTime?: number, message?: string) {
    return prisma.serviceStatus.create({
      data: { serviceId: id, status, responseTime, message },
    });
  }

  async getStatuses() {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { statuses: { orderBy: { checkedAt: 'desc' }, take: 1 } },
      orderBy: { order: 'asc' },
    });
    return services.map(s => ({
      id: s.id, name: s.name, type: s.type, icon: s.icon, color: s.color, url: s.url,
      status: s.statuses[0]?.status || 'UNKNOWN',
      responseTime: s.statuses[0]?.responseTime || null,
      lastChecked: s.statuses[0]?.checkedAt || null,
    }));
  }
}

export const servicesService = new ServicesService();
