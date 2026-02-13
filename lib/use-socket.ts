import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getStoredToken } from './auth-context';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const BASE_URL = API_URL.replace('/api/v1', '');

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const socket = io(`${BASE_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Chat socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Chat socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.log('Chat socket error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('joinRoom', { roomId });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('leaveRoom', { roomId });
  }, []);

  const sendMessage = useCallback((roomId: string, content: string) => {
    socketRef.current?.emit('sendMessage', { roomId, content });
  }, []);

  const emitTyping = useCallback((roomId: string) => {
    socketRef.current?.emit('typing', { roomId });
  }, []);

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    socketRef.current?.on('newMessage', callback);
    return () => {
      socketRef.current?.off('newMessage', callback);
    };
  }, []);

  const onUserTyping = useCallback((callback: (data: { userId: string; firstName: string }) => void) => {
    socketRef.current?.on('userTyping', callback);
    return () => {
      socketRef.current?.off('userTyping', callback);
    };
  }, []);

  const onError = useCallback((callback: (data: { message: string }) => void) => {
    socketRef.current?.on('error', callback);
    return () => {
      socketRef.current?.off('error', callback);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    emitTyping,
    onNewMessage,
    onUserTyping,
    onError,
  };
}
