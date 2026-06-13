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

  async getLayout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const layout = await dashboardService.getLayout(userId);
      sendSuccess(res, layout, 'Dashboard layout');
    } catch (error) { next(error); }
  }

  async saveLayout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { dashboardId, layout } = req.body;
      await dashboardService.saveLayout(userId, dashboardId, layout);
      sendSuccess(res, null, 'Layout saved successfully');
    } catch (error) { next(error); }
  }

  async getAvailableWidgets(req: Request, res: Response, next: NextFunction) {
    try {
      const widgets = await dashboardService.getAvailableWidgets();
      sendSuccess(res, widgets, 'Available widgets');
    } catch (error) { next(error); }
  }

  async addWidgetToDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { dashboardId, widgetId, title, config } = req.body;
      const dw = await dashboardService.addWidgetToDashboard(dashboardId, widgetId, title, config);
      sendSuccess(res, dw, 'Widget added to dashboard', 201);
    } catch (error) { next(error); }
  }

  async removeWidgetFromDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await dashboardService.removeWidgetFromDashboard(id);
      sendSuccess(res, null, 'Widget removed from dashboard');
    } catch (error) { next(error); }
  }
}

export const dashboardController = new DashboardController();
