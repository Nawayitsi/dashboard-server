import { Request, Response, NextFunction } from 'express';
import { logsService } from './logs.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { LogLevel } from '@prisma/client';

export class LogsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { level, source, serviceId, search, page, limit, hours } = req.query;
      const result = await logsService.findAll({
        level: level as LogLevel, source: source as string, serviceId: serviceId as string,
        search: search as string, page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 50, hours: parseInt(hours as string) || 24,
      });
      sendPaginated(res, result.logs, result.total, parseInt(page as string) || 1, parseInt(limit as string) || 50);
    } catch (error) { next(error); }
  }

  async getSources(req: Request, res: Response, next: NextFunction) {
    try { const sources = await logsService.getSources(); sendSuccess(res, sources); }
    catch (error) { next(error); }
  }
}

export const logsController = new LogsController();
