'use client';


import { useRouter } from 'next/navigation';
import LawyerSearch from '@/components/LawyerSearch';
import { type LawyerProfile } from '@/lib/lawyer-profiles';

export default function LawyersPage() {
  const router = useRouter();

  const handleViewProfile = (profile: LawyerProfile) => {
    router.push(`/lawyers/${profile.id}`);
  };

  const handleContact = (profile: LawyerProfile) => {
    // TODO: Implement contact functionality
    alert(`Contact functionality for ${profile.user?.name} will be implemented in the case management system`);
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
