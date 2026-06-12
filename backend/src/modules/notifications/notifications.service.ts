import prisma from '../../config/database';

export class NotificationsService {
  async findAll(userId: string, page = 1, limit = 20) {
    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId }, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, total, unread };
  }

  async markAsRead(userId: string, ids?: string[]) {
    const where: any = { userId };
    if (ids?.length) where.id = { in: ids };
    await prisma.notification.updateMany({ where, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  }

  async create(data: { userId: string; title: string; message: string; type?: any; link?: string; }) {
    return prisma.notification.create({ data });
  }

  async delete(id: string, userId: string) {
    await prisma.notification.deleteMany({ where: { id, userId } });
  }
}

export const notificationsService = new NotificationsService();
