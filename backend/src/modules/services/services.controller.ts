import { Request, Response, NextFunction } from 'express';
import { servicesService } from './services.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class ServicesController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { services, total } = await servicesService.findAll(page, limit);
      sendPaginated(res, services, total, page, limit);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await servicesService.findById(req.params.id);
      sendSuccess(res, service);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await servicesService.create(req.body);
      sendSuccess(res, service, 'Service created', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await servicesService.update(req.params.id, req.body);
      sendSuccess(res, service, 'Service updated');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await servicesService.delete(req.params.id);
      sendSuccess(res, null, 'Service deleted');
    } catch (error) { next(error); }
  }

  async getStatuses(req: Request, res: Response, next: NextFunction) {
    try {
      const statuses = await servicesService.getStatuses();
      sendSuccess(res, statuses);
    } catch (error) { next(error); }
  }
}

export const servicesController = new ServicesController();
