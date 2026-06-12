import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => notificationsController.findAll(req, res, next));
router.put('/read', (req, res, next) => notificationsController.markAsRead(req, res, next));
router.put('/read-all', (req, res, next) => notificationsController.markAllAsRead(req, res, next));
router.delete('/:id', (req, res, next) => notificationsController.delete(req, res, next));

export default router;
