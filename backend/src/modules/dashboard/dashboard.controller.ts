import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await dashboardService.getOverview();
      sendSuccess(res, overview, 'Dashboard overview');
    } catch (error) { next(error); }
  }

  async getSystemMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const metrics = await dashboardService.getSystemMetrics(hours);
      sendSuccess(res, metrics, 'System metrics');
    } catch (error) { next(error); }
  }
}

export const dashboardController = new DashboardController();
