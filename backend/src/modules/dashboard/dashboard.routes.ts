import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', (req, res, next) => dashboardController.getOverview(req, res, next));
router.get('/metrics', (req, res, next) => dashboardController.getSystemMetrics(req, res, next));

export default router;
