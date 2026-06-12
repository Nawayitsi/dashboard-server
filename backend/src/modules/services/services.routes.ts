import { Router } from 'express';
import { servicesController } from './services.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => servicesController.findAll(req, res, next));
router.get('/statuses', (req, res, next) => servicesController.getStatuses(req, res, next));
router.get('/:id', (req, res, next) => servicesController.findById(req, res, next));
router.post('/', adminOnly, (req, res, next) => servicesController.create(req, res, next));
router.put('/:id', adminOnly, (req, res, next) => servicesController.update(req, res, next));
router.delete('/:id', adminOnly, (req, res, next) => servicesController.delete(req, res, next));

export default router;
