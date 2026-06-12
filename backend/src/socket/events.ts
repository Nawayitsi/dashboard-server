// Socket.IO Event Constants
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Metrics
  METRICS_UPDATE: 'metrics:update',
  METRICS_SUBSCRIBE: 'metrics:subscribe',
  METRICS_UNSUBSCRIBE: 'metrics:unsubscribe',

  // Services
  SERVICE_STATUS: 'service:status',
  SERVICE_STATUS_CHANGE: 'service:status:change',

  // Alerts
  ALERT_NEW: 'alert:new',
  ALERT_RESOLVED: 'alert:resolved',
  ALERT_ACKNOWLEDGED: 'alert:acknowledged',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',

  // Logs
  LOG_NEW: 'log:new',

  // System
  SYSTEM_STATUS: 'system:status',
} as const;
