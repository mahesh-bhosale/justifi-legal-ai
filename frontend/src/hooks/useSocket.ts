import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface UseSocketOptions {
  caseId?: number;
  autoConnect?: boolean;
}

interface Message {
  id: number;
  caseId: number;
  senderId: string;
  recipientId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { caseId, autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = Cookies.get('token');
    if (!token) {
      setError('No authentication token found');
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    socketRef.current = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // Auto-join case room if caseId provided
      if (caseId) {
        joinCase(caseId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    socketRef.current.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });
  }, [caseId]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const joinCase = (caseId: number) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket not connected, cannot join case');
      return;
    }
    
    socketRef.current.emit('join:case', { caseId });
  };

  const leaveCase = (caseId: number) => {
    if (!socketRef.current?.connected) return;
    
    socketRef.current.emit('leave:case', { caseId });
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('message:new', callback);
    
    return () => {
      socketRef.current?.off('message:new', callback);
    };
  };

  const onMessageRead = (callback: (message: Message) => void) => {
    if (!socketRef.current) return;
    
    socketRef.current.on('message:read', callback);
    
    return () => {
      socketRef.current?.off('message:read', callback);
    };
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  useEffect(() => {
    if (caseId && socketRef.current?.connected) {
      joinCase(caseId);
    }
  }, [caseId]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    joinCase,
    leaveCase,
    onNewMessage,
    onMessageRead,
  };
};
