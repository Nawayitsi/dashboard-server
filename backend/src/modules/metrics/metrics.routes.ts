import { Router } from 'express';
import { metricsController } from './metrics.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => metricsController.query(req, res, next));
router.get('/realtime', (req, res, next) => metricsController.getRealtime(req, res, next));
router.get('/aggregated', (req, res, next) => metricsController.getAggregated(req, res, next));

export default router;
