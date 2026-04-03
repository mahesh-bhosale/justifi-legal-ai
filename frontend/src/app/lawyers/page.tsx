'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LawyerSearch from '@/components/LawyerSearch';
import { type LawyerProfile } from '@/lib/lawyer-profiles';

export default function LawyersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleViewProfile = (profile: LawyerProfile) => {
    router.push(`/lawyers/${profile.id}`);
  };

  const handleContact = (profile: LawyerProfile) => {
    // Wait for auth to load
    if (isLoading) {
      return;
    }

    if (!user) {
      // Redirect to login with lawyer info preserved in query params
      const lawyerId = profile.userId;
      const lawyerName = profile.user?.name || 'Lawyer';
      router.push(`/auth/login?lawyerId=${lawyerId}&lawyerName=${encodeURIComponent(lawyerName)}`);
      return;
    }

    // Check role (case-insensitive, trimmed)
    const userRole = user.role?.toLowerCase().trim();
    
    if (userRole !== 'citizen') {
      // Silently redirect non-citizens to their dashboard
      router.push('/dashboard');
      return;
    }

    // Redirect to case creation with lawyer pre-selection
    router.push(`/cases/create?lawyerId=${profile.userId}&lawyerName=${encodeURIComponent(profile.user?.name || 'Lawyer')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10 border-l-4 border-amber-500 pl-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your <span className="text-amber-600 dark:text-amber-500">Legal Expert</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Connect with verified lawyers who specialize in your area of need. 
            Search by specialization, location, experience, and more.
          </p>
        </div>

        <LawyerSearch
          onViewProfile={handleViewProfile}
          onContact={handleContact}
          showContactButton={true}
        />
      </div>
    </div>
  );
}
