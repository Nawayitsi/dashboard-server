import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', (req, res, next) => dashboardController.getOverview(req, res, next));
router.get('/metrics', (req, res, next) => dashboardController.getSystemMetrics(req, res, next));
router.get('/layout', (req, res, next) => dashboardController.getLayout(req, res, next));
router.post('/layout', (req, res, next) => dashboardController.saveLayout(req, res, next));
router.get('/widgets/available', (req, res, next) => dashboardController.getAvailableWidgets(req, res, next));
router.post('/widgets', (req, res, next) => dashboardController.addWidgetToDashboard(req, res, next));
router.delete('/widgets/:id', (req, res, next) => dashboardController.removeWidgetFromDashboard(req, res, next));

export default router;
