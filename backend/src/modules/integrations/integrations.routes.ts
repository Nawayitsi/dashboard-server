import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/rbac';
import { integrationRegistry } from '../../integrations/base/integration.registry';
import prisma from '../../config/database';
import { sendSuccess, sendError } from '../../utils/response';
import { encrypt, decrypt } from '../../utils/encryption';

const router = Router();
router.use(authenticate);

// ─── List all integrations ────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const integrations = await prisma.integration.findMany({
      orderBy: { name: 'asc' },
      include: {
        credentials: { select: { id: true, key: true, isEncrypted: true } }, // Never send values
      },
    });
    sendSuccess(res, integrations);
  } catch (error) { next(error); }
});

// ─── Get all available connector schemas (for wizard) ────
// MUST be before /:id to avoid matching 'schemas' as an ID
router.get('/schemas/all', async (_req, res, next) => {
  try {
    const connectors = integrationRegistry.getAll();
    const schemas = connectors.map(c => ({
      type: c.type,
      name: c.name,
      schema: c.configurationSchema(),
    }));
    sendSuccess(res, schemas);
  } catch (error) { next(error); }
});

// ─── Get integration by ID ───────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: req.params.id as string },
      include: {
        credentials: { select: { id: true, key: true, isEncrypted: true } },
      },
    });
    if (!integration) { sendError(res, 'Integration not found', 404); return; }
    sendSuccess(res, integration);
  } catch (error) { next(error); }
});

// ─── Get configuration schema for an integration type ────
router.get('/:id/schema', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findUnique({ where: { id: req.params.id as string } });
    if (!integration) { sendError(res, 'Integration not found', 404); return; }

    const connector = integrationRegistry.get(integration.type);
    if (!connector) { sendError(res, 'Connector not registered', 404); return; }

    const schema = connector.configurationSchema();
    sendSuccess(res, schema);
  } catch (error) { next(error); }
});

// ─── Update integration config ───────────────────────────
router.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const { config, isEnabled, name } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (config) updateData.config = config;

    const integration = await prisma.integration.update({
      where: { id: req.params.id as string },
      data: updateData,
    });
    sendSuccess(res, integration, 'Integration updated');
  } catch (error) { next(error); }
});

// ─── Save integration credentials (encrypted) ───────────
router.put('/:id/credentials', adminOnly, async (req, res, next) => {
  try {
    const integrationId = req.params.id as string;
    const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
    if (!integration) { sendError(res, 'Integration not found', 404); return; }

    const credentials: Record<string, string> = req.body.credentials || {};

    // Upsert each credential key
    for (const [key, value] of Object.entries(credentials)) {
      if (value === undefined || value === null) continue;
      const strValue = String(value);
      // Encrypt sensitive fields
      const sensitiveKeys = ['password', 'apitoken', 'secret', 'token', 'apppassword'];
      const shouldEncrypt = sensitiveKeys.some(sk => key.toLowerCase().includes(sk));
      const encryptedValue = shouldEncrypt ? encrypt(strValue) : strValue;

      await prisma.integrationCredential.upsert({
        where: { integrationId_key: { integrationId, key } },
        update: { value: encryptedValue, isEncrypted: shouldEncrypt },
        create: { integrationId, key, value: encryptedValue, isEncrypted: shouldEncrypt },
      });
    }

    sendSuccess(res, null, 'Credentials saved');
  } catch (error) { next(error); }
});

// ─── Get decrypted credentials (admin only) ──────────────
router.get('/:id/credentials', adminOnly, async (req, res, next) => {
  try {
    const credentials = await prisma.integrationCredential.findMany({
      where: { integrationId: req.params.id as string },
    });

    const decrypted: Record<string, string> = {};
    for (const cred of credentials) {
      if (cred.isEncrypted) {
        try {
          decrypted[cred.key] = decrypt(cred.value);
        } catch {
          decrypted[cred.key] = '***DECRYPTION_FAILED***';
        }
      } else {
        decrypted[cred.key] = cred.value;
      }
    }

    sendSuccess(res, decrypted);
  } catch (error) { next(error); }
});

// ─── Test integration connection ─────────────────────────
router.post('/:id/test', adminOnly, async (req, res, next) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: req.params.id as string },
      include: { credentials: true },
    });
    if (!integration) { sendError(res, 'Integration not found', 404); return; }

    const connector = integrationRegistry.get(integration.type);
    if (!connector) { sendError(res, 'Connector not found', 404); return; }

    // Build config from credentials
    const configFromCreds: Record<string, any> = {};
    for (const cred of integration.credentials) {
      configFromCreds[cred.key] = cred.isEncrypted ? decrypt(cred.value) : cred.value;
    }

    // Merge with legacy JSON config field
    const mergedConfig = { ...(integration.config as Record<string, any> || {}), ...configFromCreds };

    await connector.initialize(mergedConfig);
    const result = await connector.testConnection();

    await prisma.integration.update({
      where: { id: req.params.id as string },
      data: { status: result.success ? 'CONNECTED' : 'ERROR', lastSyncAt: new Date() },
    });

    sendSuccess(res, result, result.success ? 'Connection successful' : 'Connection failed');
  } catch (error) { next(error); }
});

// ─── Sync integration (force data collection) ────────────
router.post('/:id/sync', adminOnly, async (req, res, next) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: req.params.id as string },
      include: { credentials: true },
    });
    if (!integration) { sendError(res, 'Integration not found', 404); return; }

    const connector = integrationRegistry.get(integration.type);
    if (!connector) { sendError(res, 'Connector not found', 404); return; }

    const configFromCreds: Record<string, any> = {};
    for (const cred of integration.credentials) {
      configFromCreds[cred.key] = cred.isEncrypted ? decrypt(cred.value) : cred.value;
    }
    const mergedConfig = { ...(integration.config as Record<string, any> || {}), ...configFromCreds };

    await connector.initialize(mergedConfig);
    const health = await connector.getStatus();
    const metrics = await connector.collectMetrics();

    await prisma.integration.update({
      where: { id: req.params.id as string },
      data: {
        status: health.status === 'online' ? 'CONNECTED' : health.status === 'offline' ? 'DISCONNECTED' : 'ERROR',
        lastSyncAt: new Date(),
      },
    });

    sendSuccess(res, { health, metricsCount: metrics.length }, 'Sync completed');
  } catch (error) { next(error); }
});

// ─── Delete integration ──────────────────────────────────
router.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    await prisma.integration.delete({ where: { id: req.params.id as string } });
    sendSuccess(res, null, 'Integration deleted');
  } catch (error) { next(error); }
});

export default router;
