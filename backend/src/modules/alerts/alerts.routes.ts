import { Router } from 'express';
import { alertsController } from './alerts.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => alertsController.findAll(req, res, next));
router.get('/stats', (req, res, next) => alertsController.getStats(req, res, next));
router.post('/', adminOnly, (req, res, next) => alertsController.create(req, res, next));
router.put('/:id/acknowledge', adminOnly, (req, res, next) => alertsController.acknowledge(req, res, next));
router.put('/:id/resolve', adminOnly, (req, res, next) => alertsController.resolve(req, res, next));

export default router;
