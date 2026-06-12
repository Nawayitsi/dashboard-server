import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { loginSchema, refreshSchema } from './auth.schema';
import { authLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', validate(refreshSchema), (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

export default router;
