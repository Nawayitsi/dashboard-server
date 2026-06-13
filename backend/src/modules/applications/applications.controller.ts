import { Request, Response, NextFunction } from 'express';
import { applicationsService } from './applications.service';
import { sendSuccess } from '../../utils/response';

export class ApplicationsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const apps = await applicationsService.findAll();
      sendSuccess(res, apps);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await applicationsService.findById(req.params.id as string);
      sendSuccess(res, app);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await applicationsService.create(req.body);
      sendSuccess(res, app, 'Application created', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await applicationsService.update(req.params.id as string, req.body);
      sendSuccess(res, app, 'Application updated');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await applicationsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Application deleted');
    } catch (error) { next(error); }
  }
}

export const applicationsController = new ApplicationsController();
