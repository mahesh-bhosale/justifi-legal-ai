'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import DashboardTopbar from '../../components/DashboardTopbar';
import DashboardSidebar from '../../components/DashboardSidebar';
import { getToken } from '../../lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const returnUrl = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }
    setAuthChecked(true);
  }, [pathname, router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 dark:border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm dark:bg-black/60 z-40 lg:hidden transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] min-h-screen">
        {/* Sidebar */}
        <DashboardSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={setIsSidebarCollapsed}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={setIsMobileMenuOpen}
        />
        
        {/* Main Content */}
        <div className="flex flex-col">
          {/* Topbar */}
          <DashboardTopbar 
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          
          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
