import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { integrationRegistry } from '../../integrations/base/integration.registry';
import prisma from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();
router.use(authenticate);

// List all integrations
router.get('/', async (req, res, next) => {
  try {
    const integrations = await prisma.integration.findMany({ orderBy: { name: 'asc' } });
    sendSuccess(res, integrations);
  } catch (error) { next(error); }
});

// Get integration by ID
router.get('/:id', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findUnique({ where: { id: req.params.id } });
    if (!integration) { sendError(res, 'Integration not found', 404); return; }
    sendSuccess(res, integration);
  } catch (error) { next(error); }
});

// Update integration config
router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const { config, isEnabled } = req.body;
    const integration = await prisma.integration.update({
      where: { id: req.params.id },
      data: { ...(config && { config }), ...(isEnabled !== undefined && { isEnabled }) },
    });
    sendSuccess(res, integration, 'Integration updated');
  } catch (error) { next(error); }
});

// Test integration connection
router.post('/:id/test', adminOnly, async (req, res, next) => {
  try {
    const integration = await prisma.integration.findUnique({ where: { id: req.params.id } });
    if (!integration) { sendError(res, 'Integration not found', 404); return; }

    const connector = integrationRegistry.get(integration.type);
    if (!connector) { sendError(res, 'Connector not found', 404); return; }

    await connector.initialize(integration.config as Record<string, any>);
    const result = await connector.testConnection();

    await prisma.integration.update({
      where: { id: req.params.id },
      data: { status: result.success ? 'CONNECTED' : 'ERROR', lastSyncAt: new Date() },
    });

    sendSuccess(res, result, result.success ? 'Connection successful' : 'Connection failed');
  } catch (error) { next(error); }
});

export default router;
