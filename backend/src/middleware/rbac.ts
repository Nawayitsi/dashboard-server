import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401, 'Unauthorized');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403, 'Forbidden');
      return;
    }

    next();
  };
};

export const adminOnly = authorize('ADMIN');
export const viewerAndAbove = authorize('ADMIN', 'VIEWER');
