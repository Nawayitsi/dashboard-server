import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse['meta']
): void => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    meta,
  });
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  message = 'Error'
): void => {
  res.status(statusCode).json({
    success: false,
    error,
    message,
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
): void => {
  res.status(200).json({
    success: true,
    data,
    message,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
