import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { ServiceType } from '@prisma/client';

export class ApplicationsService {
  async findAll() {
    return prisma.application.findMany({
      orderBy: { order: 'asc' },
      include: {
        integration: true,
      },
    });
  }

  async findById(id: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        integration: true,
      },
    });
    if (!app) throw new AppError('Application not found', 404);
    return app;
  }

  async create(data: {
    name: string;
    description?: string;
    icon?: string;
    url?: string;
    category?: string;
    healthCheckUrl?: string;
    openIn?: 'SAME_TAB' | 'NEW_TAB' | 'EMBEDDED';
    isActive?: boolean;
    color?: string;
    order?: number;
    integrationId?: string;
  }) {
    // 1. Create the application
    const app = await prisma.application.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        url: data.url,
        category: data.category,
        healthCheckUrl: data.healthCheckUrl,
        openIn: data.openIn || 'NEW_TAB',
        isActive: data.isActive !== undefined ? data.isActive : true,
        color: data.color || '#4F8CFF',
        order: data.order || 0,
        integrationId: data.integrationId || null,
      },
    });

    // 2. Synchronize to the Service model to keep launcher working
    // Map category or use default ServiceType
    let serviceType: ServiceType = ServiceType.APPLICATION;
    if (data.category) {
      const upperCategory = data.category.toUpperCase();
      if (Object.values(ServiceType).includes(upperCategory as any)) {
        serviceType = upperCategory as ServiceType;
      }
    }

    await prisma.service.create({
      data: {
        id: app.id, // Keep the same ID
        name: app.name,
        type: serviceType,
        description: app.description,
        url: app.url,
        icon: app.icon || 'server',
        color: app.color,
        isActive: app.isActive,
        order: app.order,
      },
    });

    return app;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      icon: string;
      url: string;
      category: string;
      healthCheckUrl: string;
      openIn: 'SAME_TAB' | 'NEW_TAB' | 'EMBEDDED';
      isActive: boolean;
      color: string;
      order: number;
      integrationId: string;
    }>
  ) {
    const existing = await this.findById(id);

    // 1. Update the application
    const app = await prisma.application.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        url: data.url,
        category: data.category,
        healthCheckUrl: data.healthCheckUrl,
        openIn: data.openIn,
        isActive: data.isActive,
        color: data.color,
        order: data.order,
        integrationId: data.integrationId,
      },
    });

    // 2. Update synchronized service
    let serviceType: ServiceType | undefined = undefined;
    if (data.category) {
      const upperCategory = data.category.toUpperCase();
      if (Object.values(ServiceType).includes(upperCategory as any)) {
        serviceType = upperCategory as ServiceType;
      }
    }

    await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        type: serviceType,
        description: data.description,
        url: data.url,
        icon: data.icon,
        color: data.color,
        isActive: data.isActive,
        order: data.order,
      },
    });

    return app;
  }

  async delete(id: string) {
    await this.findById(id);

    // 1. Delete application
    await prisma.application.delete({ where: { id } });

    // 2. Delete synchronized service
    await prisma.service.delete({ where: { id } }).catch(() => {
      // Ignore if not found
    });
  }
}

export const applicationsService = new ApplicationsService();
