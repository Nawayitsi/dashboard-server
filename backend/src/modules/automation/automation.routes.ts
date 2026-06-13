import { Router } from 'express';
import { automationController } from './automation.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => automationController.findAll(req, res, next));
router.get('/:id', (req, res, next) => automationController.findById(req, res, next));

// Modifications allowed for admins only
router.post('/', adminOnly, (req, res, next) => automationController.create(req, res, next));
router.put('/:id', adminOnly, (req, res, next) => automationController.update(req, res, next));
router.delete('/:id', adminOnly, (req, res, next) => automationController.delete(req, res, next));

export default router;
