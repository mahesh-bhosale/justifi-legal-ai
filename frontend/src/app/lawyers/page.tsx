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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Legal Expert
          </h1>
          <p className="text-lg text-gray-600">
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
