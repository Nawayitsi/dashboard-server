import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const auditLog = (action: string, resource: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action,
            resource,
            resourceId: req.params.id || null,
            details: {
              method: req.method,
              path: req.path,
              body: req.method !== 'GET' ? req.body : undefined,
            },
            ipAddress: req.ip || req.socket.remoteAddress || null,
            userAgent: req.headers['user-agent'] || null,
          },
        });
      }
    } catch (error) {
      logger.error('Audit log error:', error);
    }
    next();
  };
};
