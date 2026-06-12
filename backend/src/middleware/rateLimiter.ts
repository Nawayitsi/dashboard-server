import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    message: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    message: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: {
    success: false,
    error: 'API rate limit exceeded.',
    message: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
