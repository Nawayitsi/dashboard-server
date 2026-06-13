import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { notificationChannelsController } from './channels.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => notificationsController.findAll(req, res, next));
router.put('/read', (req, res, next) => notificationsController.markAsRead(req, res, next));
router.put('/read-all', (req, res, next) => notificationsController.markAllAsRead(req, res, next));
router.delete('/:id', (req, res, next) => notificationsController.delete(req, res, next));

// ─── Notification Channels ───────────────────────────────
router.get('/channels/all', adminOnly, (req, res, next) => notificationChannelsController.findAll(req, res, next));
router.get('/channels/:id', adminOnly, (req, res, next) => notificationChannelsController.findById(req, res, next));
router.post('/channels', adminOnly, (req, res, next) => notificationChannelsController.create(req, res, next));
router.put('/channels/:id', adminOnly, (req, res, next) => notificationChannelsController.update(req, res, next));
router.delete('/channels/:id', adminOnly, (req, res, next) => notificationChannelsController.delete(req, res, next));
router.post('/channels/:id/test', adminOnly, (req, res, next) => notificationChannelsController.testChannel(req, res, next));

export default router;
