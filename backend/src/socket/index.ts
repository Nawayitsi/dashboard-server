import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { SOCKET_EVENTS } from './events';
import { config } from '../config';

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware for Socket.IO
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`🔌 Socket connected: ${user?.email} [${socket.id}]`);

    // Join user-specific room for notifications
    socket.join(`user:${user?.userId}`);

    // Join role-specific room
    socket.join(`role:${user?.role}`);

    // Handle metric subscriptions
    socket.on(SOCKET_EVENTS.METRICS_SUBSCRIBE, (serviceId?: string) => {
      const room = serviceId ? `metrics:${serviceId}` : 'metrics:global';
      socket.join(room);
      logger.debug(`📊 ${user?.email} subscribed to ${room}`);
    });

    socket.on(SOCKET_EVENTS.METRICS_UNSUBSCRIBE, (serviceId?: string) => {
      const room = serviceId ? `metrics:${serviceId}` : 'metrics:global';
      socket.leave(room);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info(`🔌 Socket disconnected: ${user?.email} [${reason}]`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

// Emit helpers
export const emitMetricsUpdate = (data: any, serviceId?: string) => {
  if (!io) return;
  const room = serviceId ? `metrics:${serviceId}` : 'metrics:global';
  io.to(room).emit(SOCKET_EVENTS.METRICS_UPDATE, data);
};

export const emitServiceStatus = (data: any) => {
  if (!io) return;
  io.emit(SOCKET_EVENTS.SERVICE_STATUS, data);
};

export const emitNewAlert = (data: any) => {
  if (!io) return;
  io.emit(SOCKET_EVENTS.ALERT_NEW, data);
};

export const emitNotification = (userId: string, data: any) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, data);
};

export const emitNewLog = (data: any) => {
  if (!io) return;
  io.emit(SOCKET_EVENTS.LOG_NEW, data);
};
