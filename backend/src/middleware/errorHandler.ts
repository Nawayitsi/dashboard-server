import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let error = err.message;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    error = err.message;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error:', { error: err.message, stack: err.stack });
  } else {
    logger.warn('Client Error:', { error: err.message, statusCode });
  }

  res.status(statusCode).json({
    success: false,
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    message: 'Not Found',
  });
};
