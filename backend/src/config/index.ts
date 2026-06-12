import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  integrations: {
    mikrotik: {
      host: process.env.MIKROTIK_HOST || '',
      port: parseInt(process.env.MIKROTIK_PORT || '8728', 10),
      username: process.env.MIKROTIK_USERNAME || '',
      password: process.env.MIKROTIK_PASSWORD || '',
    },
    nextcloud: {
      url: process.env.NEXTCLOUD_URL || '',
      username: process.env.NEXTCLOUD_USERNAME || '',
      password: process.env.NEXTCLOUD_PASSWORD || '',
    },
    synology: {
      url: process.env.SYNOLOGY_URL || '',
      username: process.env.SYNOLOGY_USERNAME || '',
      password: process.env.SYNOLOGY_PASSWORD || '',
    },
    librenms: {
      url: process.env.LIBRENMS_URL || '',
      apiToken: process.env.LIBRENMS_API_TOKEN || '',
    },
    safeline: {
      url: process.env.SAFELINE_URL || '',
      apiToken: process.env.SAFELINE_API_TOKEN || '',
    },
    siem: {
      url: process.env.SIEM_URL || '',
      apiToken: process.env.SIEM_API_TOKEN || '',
    },
  },
} as const;
