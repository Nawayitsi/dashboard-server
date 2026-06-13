import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => settingsController.findAll(req, res, next));
router.get('/appearance', (req, res, next) => settingsController.getAppearance(req, res, next));
router.put('/appearance', adminOnly, (req, res, next) => settingsController.updateAppearance(req, res, next));
router.get('/:key', (req, res, next) => settingsController.get(req, res, next));
router.put('/', adminOnly, (req, res, next) => settingsController.update(req, res, next));

export default router;
