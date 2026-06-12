import { sendSuccess } from '../utils/response';
import { Request, Response } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';

export const healthCheck = async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch {
    checks.database = 'unhealthy';
  }

  // Redis check
  try {
    await redis.ping();
    checks.redis = 'healthy';
  } catch {
    checks.redis = 'unhealthy';
  }

  const allHealthy = Object.values(checks).every(v => v === 'healthy');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: allHealthy,
    data: {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
};
