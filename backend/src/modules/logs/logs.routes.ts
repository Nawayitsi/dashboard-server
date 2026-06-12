import { Router } from 'express';
import { logsController } from './logs.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res, next) => logsController.findAll(req, res, next));
router.get('/sources', (req, res, next) => logsController.getSources(req, res, next));

export default router;
