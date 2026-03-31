'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken, decodeUser, removeToken, getRefreshToken } from '@/lib/auth';
import api from '@/lib/api';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
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
  const [socket, setSocket] = useState<Socket | null>(null);

  // Function to update user data
  const updateUser = useCallback((newUser: User | null) => {
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
      setSocket((prev: Socket | null) => {
        prev?.disconnect();
        return null;
      });
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
    setSocket(socket);

    socket.on('connect', () => {
      if (user.id) {
        socket.emit('join-user', user.id);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Reconnect manually
        socket.connect();
      }
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Load user data on mount and when token changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getToken();

        if (!token) {
          updateUser(null);
          return;
        }
        
        try {
          const decoded = decodeUser();

          if (decoded) {
            const userData: User = {
              id: String(decoded.id || '').trim(),
              email: String(decoded.email || '').trim(),
              role: String(decoded.role || 'citizen').trim(),
              name: decoded.name?.trim(),
            };
            
            if (!userData.id) {
              console.error('AuthProvider - No user ID found in token');
              updateUser(null);
              return;
            }
            
            updateUser(userData);

            // Hydrate latest user data from backend (JWT may not include updated name)
            try {
              const res = await api.get('/api/profile');
              if (res.data?.success && res.data?.data) {
                const serverUser = res.data.data as { name?: string; email?: string; role?: string; id?: string };
                if (serverUser?.name) {
                  updateUser({
                    ...userData,
                    name: String(serverUser.name).trim(),
                  });
                }
              }
            } catch {
              // ignore (token might be valid locally but backend unreachable)
            }
          } else {
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

  const value = useMemo(
    () => ({
      user,
      isLoading,
      socket,
      setUser: updateUser,
      logout: () => {
        const rt = getRefreshToken();
        if (rt) {
          void api.post('/api/auth/logout', { refreshToken: rt }).catch(() => {});
        }
        removeToken();
        setUser(null);
        window.location.href = '/auth/login';
      },
    }),
    [user, isLoading, socket, updateUser]
  );

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
