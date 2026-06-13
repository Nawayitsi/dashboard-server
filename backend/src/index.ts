import http from 'http';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { initializeSocket } from './socket';
import redis from './config/redis';
import prisma from './config/database';

// Integration Registry
import { integrationRegistry } from './integrations/base/integration.registry';
import { mikrotikConnector } from './integrations/mikrotik/mikrotik.connector';
import { nextcloudConnector } from './integrations/nextcloud/nextcloud.connector';
import { synologyConnector } from './integrations/synology/synology.connector';
import { librenmsConnector } from './integrations/librenms/librenms.connector';
import { safelineConnector } from './integrations/safeline/safeline.connector';
import { siemConnector } from './integrations/siem/siem.connector';
import { npmConnector } from './integrations/npm/npm.connector';
import { metricsScheduler } from './jobs/metrics.job';

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Register all integrations
integrationRegistry.register(mikrotikConnector);
integrationRegistry.register(nextcloudConnector);
integrationRegistry.register(synologyConnector);
integrationRegistry.register(librenmsConnector);
integrationRegistry.register(safelineConnector);
integrationRegistry.register(siemConnector);
integrationRegistry.register(npmConnector);

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Connect to Redis
    await redis.connect();

    // Start background metrics poller scheduler
    metricsScheduler.start();

    server.listen(config.port, () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🏠 HomelabOS Backend v1.0.0                    ║
║                                                  ║
║   Server:  http://localhost:${config.port}              ║
║   Env:     ${config.nodeEnv.padEnd(36)}║
║   Socket:  WebSocket enabled                     ║
║                                                  ║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('🛑 Shutting down...');
  metricsScheduler.stop();
  server.close();
  await prisma.$disconnect();
  await redis.disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
