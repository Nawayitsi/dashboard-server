import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';

const router = Router();

router.use(authenticate);
router.get('/', adminOnly, (req, res, next) => usersController.findAll(req, res, next));
router.get('/:id', adminOnly, (req, res, next) => usersController.findById(req, res, next));
router.post('/', adminOnly, (req, res, next) => usersController.create(req, res, next));
router.put('/:id', adminOnly, (req, res, next) => usersController.update(req, res, next));
router.delete('/:id', adminOnly, (req, res, next) => usersController.delete(req, res, next));

export default router;
