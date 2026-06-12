import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { healthCheck } from './services/health.service';

// Routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import servicesRoutes from './modules/services/services.routes';
import metricsRoutes from './modules/metrics/metrics.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import logsRoutes from './modules/logs/logs.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import settingsRoutes from './modules/settings/settings.routes';
import integrationsRoutes from './modules/integrations/integrations.routes';

const app = express();

// ─── Global Middleware ────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', healthCheck);

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/integrations', integrationsRoutes);

// ─── Error Handling ───────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
