import { Request, Response, NextFunction } from 'express';
import { alertsService } from './alerts.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { Severity } from '@prisma/client';

export class AlertsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { severity, isResolved, page, limit } = req.query;
      const result = await alertsService.findAll({
        severity: severity as Severity, isResolved: isResolved === 'true' ? true : isResolved === 'false' ? false : undefined,
        page: parseInt(page as string) || 1, limit: parseInt(limit as string) || 20,
      });
      sendPaginated(res, result.alerts, result.total, parseInt(page as string) || 1, parseInt(limit as string) || 20);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try { const alert = await alertsService.create(req.body); sendSuccess(res, alert, 'Alert created', 201); }
    catch (error) { next(error); }
  }

  async acknowledge(req: Request, res: Response, next: NextFunction) {
    try { const alert = await alertsService.acknowledge(req.params.id); sendSuccess(res, alert, 'Alert acknowledged'); }
    catch (error) { next(error); }
  }

  async resolve(req: Request, res: Response, next: NextFunction) {
    try { const alert = await alertsService.resolve(req.params.id); sendSuccess(res, alert, 'Alert resolved'); }
    catch (error) { next(error); }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try { const stats = await alertsService.getStats(); sendSuccess(res, stats); }
    catch (error) { next(error); }
  }
}

export const alertsController = new AlertsController();
