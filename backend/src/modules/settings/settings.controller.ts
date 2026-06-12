import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { sendSuccess } from '../../utils/response';

export class SettingsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const group = req.query.group as string;
      const settings = await settingsService.findAll(group);
      sendSuccess(res, settings);
    } catch (error) { next(error); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await settingsService.get(req.params.key);
      sendSuccess(res, setting);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      if (Array.isArray(settings)) {
        const result = await settingsService.bulkUpdate(settings);
        sendSuccess(res, result, 'Settings updated');
      } else {
        const { key, value, group } = req.body;
        const result = await settingsService.upsert(key, value, group);
        sendSuccess(res, result, 'Setting updated');
      }
    } catch (error) { next(error); }
  }
}

export const settingsController = new SettingsController();
