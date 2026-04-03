'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '../../lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const role = getUserRole();
    
    if (!role) {
      // No role found, redirect to login
      router.push('/auth/login');
      return;
    }

    // Role-based redirects
    switch (role) {
      case 'citizen':
        router.push('/dashboard/citizen');
        break;
      case 'lawyer':
        router.push('/dashboard/lawyer');
        break;
      case 'admin':
        router.push('/dashboard/admin');
        break;
      default:
        // Unknown role, redirect to login
        router.push('/auth/login');
        break;
    }
  }, [router]);

  // Loading state while redirecting
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 dark:border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 dark:border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
