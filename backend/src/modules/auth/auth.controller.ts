import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      await authService.logout(req.user.userId);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const user = await authService.me(req.user.userId);
      sendSuccess(res, user, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
