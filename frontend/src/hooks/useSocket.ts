import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const subscribeToMetrics = (serviceId?: string) => {
    if (socketRef.current) {
      socketRef.current.emit('metrics:subscribe', serviceId);
    }
  };

  const unsubscribeFromMetrics = (serviceId?: string) => {
    if (socketRef.current) {
      socketRef.current.emit('metrics:unsubscribe', serviceId);
    }
  };

  const onEvent = <T>(event: string, callback: (data: T) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  };

  return {
    isConnected,
    socket: socketRef.current,
    subscribeToMetrics,
    unsubscribeFromMetrics,
    onEvent,
  };
}
