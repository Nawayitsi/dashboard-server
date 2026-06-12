import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class NotificationsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationsService.findAll(req.user.userId, page, limit);
      res.json({ success: true, data: result.notifications, unread: result.unread, meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } });
    } catch (error) { next(error); }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const { ids } = req.body;
      await notificationsService.markAsRead(req.user.userId, ids);
      sendSuccess(res, null, 'Notifications marked as read');
    } catch (error) { next(error); }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      await notificationsService.markAllAsRead(req.user.userId);
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      await notificationsService.delete(req.params.id as string, req.user.userId);
      sendSuccess(res, null, 'Notification deleted');
    } catch (error) { next(error); }
  }
}

export const notificationsController = new NotificationsController();
