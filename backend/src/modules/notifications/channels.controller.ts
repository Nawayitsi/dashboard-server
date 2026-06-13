import { Request, Response, NextFunction } from 'express';
import { notificationChannelsService } from './channels.service';
import { sendSuccess } from '../../utils/response';

export class NotificationChannelsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const channels = await notificationChannelsService.findAll();
      sendSuccess(res, channels);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await notificationChannelsService.findById(req.params.id as string);
      sendSuccess(res, channel);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await notificationChannelsService.create(req.body);
      sendSuccess(res, channel, 'Notification channel created', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const channel = await notificationChannelsService.update(req.params.id as string, req.body);
      sendSuccess(res, channel, 'Notification channel updated');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationChannelsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Notification channel deleted');
    } catch (error) { next(error); }
  }

  async testChannel(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationChannelsService.testChannel(req.params.id as string);
      sendSuccess(res, null, 'Test notification sent successfully');
    } catch (error) { next(error); }
  }
}

export const notificationChannelsController = new NotificationChannelsController();
