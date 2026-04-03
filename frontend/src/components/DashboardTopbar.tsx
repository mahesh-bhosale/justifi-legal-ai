'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import ThemeToggle from './ui/ThemeToggle';

interface DashboardTopbarProps {
  onMobileMenuToggle: () => void;
}

type Notification = {
  id: number;
  userId: string;
  caseId: number | null;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  meta: any;
  createdAt: string;
};

export default function DashboardTopbar({ onMobileMenuToggle }: DashboardTopbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { logout, socket, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const dismissTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setIsClient(true);
    setUserRole(getUserRole());
  }, []);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0),
    [notifications]
  );

  const sortedNotifications = useMemo(() => {
    const copy = [...notifications];
    copy.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return copy.slice(0, 40);
  }, [notifications]);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await api.get('/api/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isNotificationsOpen) void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!socket) return;

    const handler = (notification: Notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on('notification:new', handler);
    return () => {
      socket.off('notification:new', handler);
    };
  }, [socket]);

  useEffect(() => {
    const timers = dismissTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const scheduleRemoveFromDb = (id: number) => {
    if (dismissTimers.current.has(id)) return;
    const t = setTimeout(() => {
      void (async () => {
        try {
          await api.delete(`/api/notifications/${id}`);
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
          console.error('Failed to remove notification:', err);
        } finally {
          dismissTimers.current.delete(id);
        }
      })();
    }, 2200);
    dismissTimers.current.set(id, t);
  };

  const markNotificationRead = async (id: number) => {
    try {
      const res = await api.patch(`/api/notifications/${id}/read`, {});
      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        scheduleRemoveFromDb(id);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const dismissNotificationNow = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pending = dismissTimers.current.get(id);
    if (pending) clearTimeout(pending);
    dismissTimers.current.delete(id);
    try {
      await api.patch(`/api/notifications/${id}/read`, {}).catch(() => undefined);
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const typeLabel = (t: string) => {
    if (t === 'message') return 'Message';
    if (t === 'document') return 'Document';
    return 'Case';
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const formatRelativeTime = (iso: string) => {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  };

  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and breadcrumb */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button - only visible on mobile */}
          <button 
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Dashboard</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 dark:text-white capitalize">{isClient ? userRole : 'Loading...'}</span>
          </nav>
        </div>

        {/* Right side - Theme toggle, Notifications, user menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Unread first. Open one to mark read; it clears shortly after.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadNotifications()}
                    className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all border border-transparent hover:border-amber-200 dark:hover:border-amber-900/50"
                  >
                    Refresh
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-6 text-sm text-gray-500 dark:text-gray-400 text-center">Loading…</div>
                  ) : sortedNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">You&apos;re all caught up</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New alerts for messages, cases, and documents appear here.</p>
                    </div>
                  ) : (
                    sortedNotifications.map((n) => (
                      <div
                        key={n.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => void markNotificationRead(n.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            void markNotificationRead(n.id);
                          }
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/90 dark:hover:bg-gray-800/90 cursor-pointer flex gap-3 transition-colors ${
                          n.isRead ? 'bg-white dark:bg-gray-900' : 'bg-amber-50/40 dark:bg-amber-900/10'
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${
                            n.isRead ? 'bg-transparent' : 'bg-amber-500'
                          }`}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{n.title}</p>
                            <span className="shrink-0 text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">
                              {typeLabel(n.type)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">{n.body}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">{formatRelativeTime(n.createdAt)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => void dismissNotificationNow(n.id, e)}
                          className="shrink-0 self-start text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-1 py-0.5 rounded"
                          title="Dismiss now"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{isClient ? userRole : 'Loading...'}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      router.push(`/dashboard/${userRole || 'citizen'}/profile`);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      const role = (userRole || 'citizen').toLowerCase();
                      router.push(`/dashboard/${role}/settings`);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </div>
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-800" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isUserMenuOpen || isNotificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
}
