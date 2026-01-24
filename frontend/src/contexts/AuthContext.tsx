'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken, decodeUser, removeToken } from '@/lib/auth';

export interface User {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  socket: Socket | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Function to update user data
  const updateUser = useCallback((newUser: User | null) => {
    console.log('Updating user context:', newUser);
    setUser(newUser);
    // Ensure we don't show loading state after first initialization
    if (!initialized) {
      setIsLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (!user) {
      // Disconnect socket if no user is logged in
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initialize WebSocket connection - use environment variable for production
    // WebSocket runs on the same server as the REST API
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(socketUrl, {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true,
      withCredentials: true,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('WebSocket connected with ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect manually
        socket.connect();
      }
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socketRef.current = socket;

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      console.error('Error details:', error);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('joined:case', (data) => {
      console.log('Successfully joined room:', data);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Load user data on mount and when token changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getToken();
        console.log('AuthProvider - Loading user, token exists:', !!token);
        
        if (!token) {
          console.log('AuthProvider - No token found, setting user to null');
          updateUser(null);
          return;
        }
        
        try {
          const decoded = decodeUser();
          console.log('AuthProvider - Decoded user data:', decoded);
          
          if (decoded) {
            const userData = {
              id: String(decoded.id || '').trim(),
              email: String(decoded.email || '').trim(),
              role: String(decoded.role || 'citizen').trim(),
            };
            
            if (!userData.id) {
              console.error('AuthProvider - No user ID found in token');
              updateUser(null);
              return;
            }
            
            console.log('AuthProvider - Setting authenticated user:', userData);
            updateUser(userData);
          } else {
            console.log('AuthProvider - No user data in token');
            updateUser(null);
          }
        } catch (error) {
          console.error('Error decoding user from token:', error);
          updateUser(null);
        }
      } catch (error) {
        console.error('Error in AuthProvider:', error);
        updateUser(null);
      } finally {
        if (!initialized) {
          setIsLoading(false);
          setInitialized(true);
        }
      }
    };

    loadUser();
    
    // Set up a storage event listener to handle token changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'justifi_token' || !e.key) {
        console.log('AuthProvider - Storage changed, reloading user');
        loadUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateUser, initialized]);

  // Debug log when user or loading state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthContext - State update:', { 
        user, 
        isLoading,
        hasToken: !!getToken()
      });
    }
  }, [user, isLoading]);

  const value = {
    user,
    isLoading,
    socket: socketRef.current,
    setUser: updateUser,
    logout: () => {
      removeToken();
      setUser(null);
      window.location.href = '/auth/login';
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
