import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class UsersController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { users, total } = await usersService.findAll(page, limit);
      sendPaginated(res, users, total, page, limit);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.findById(req.params.id as string);
      sendSuccess(res, user);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      sendSuccess(res, user, 'User created', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id as string, req.body);
      sendSuccess(res, user, 'User updated');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id as string);
      sendSuccess(res, null, 'User deleted');
    } catch (error) { next(error); }
  }
}

export const usersController = new UsersController();
