import { Request, Response, NextFunction } from 'express';
import { metricsService } from './metrics.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { MetricType } from '@prisma/client';

export class MetricsController {
  async query(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, serviceId, hours, page, limit } = req.query;
      const result = await metricsService.query({
        type: type as MetricType,
        serviceId: serviceId as string,
        hours: parseInt(hours as string) || 24,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 100,
      });
      sendPaginated(res, result.metrics, result.total, parseInt(page as string) || 1, parseInt(limit as string) || 100);
    } catch (error) { next(error); }
  }

  async getRealtime(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await metricsService.getRealtime();
      sendSuccess(res, metrics);
    } catch (error) { next(error); }
  }

  async getAggregated(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, hours, interval } = req.query;
      const data = await metricsService.getAggregated(
        type as MetricType || 'CPU',
        parseInt(hours as string) || 24,
        parseInt(interval as string) || 5
      );
      sendSuccess(res, data);
    } catch (error) { next(error); }
  }
}

export const metricsController = new MetricsController();
