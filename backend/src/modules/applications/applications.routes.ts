import { Router } from 'express';
import { applicationsController } from './applications.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => applicationsController.findAll(req, res, next));
router.get('/:id', (req, res, next) => applicationsController.findById(req, res, next));
router.post('/', adminOnly, (req, res, next) => applicationsController.create(req, res, next));
router.put('/:id', adminOnly, (req, res, next) => applicationsController.update(req, res, next));
router.delete('/:id', adminOnly, (req, res, next) => applicationsController.delete(req, res, next));

export default router;
