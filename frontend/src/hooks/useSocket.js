import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { socketTaskCreated, socketTaskUpdated, socketTaskDeleted } from '../store/slices/tasksSlice.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

const useSocket = (isAuthenticated) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.io] Connected:', socket.id);
    });

    socket.on('task:created', (payload) => {
      dispatch(socketTaskCreated(payload));
    });

    socket.on('task:updated', (payload) => {
      dispatch(socketTaskUpdated(payload));
    });

    socket.on('task:deleted', (payload) => {
      dispatch(socketTaskDeleted(payload));
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, dispatch]);

  return socketRef;
};

export default useSocket;
