'use client';

import { type LawyerProfile } from '@/lib/lawyer-profiles';
import Card from './Card';
import Button from './Button';

interface LawyerCardProps {
  profile: LawyerProfile;
  onViewProfile?: (profile: LawyerProfile) => void;
  showContactButton?: boolean;
  onContact?: (profile: LawyerProfile) => void;
}

export default function LawyerCard({ 
  profile, 
  onViewProfile, 
  showContactButton = true,
  onContact 
}: LawyerCardProps) {
  const handleViewProfile = () => {
    onViewProfile?.(profile);
  };

  const handleContact = () => {
    onContact?.(profile);
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'limited':
        return 'text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      case 'unavailable':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'limited':
        return 'Limited';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const formatRating = (rating: number | string | undefined) => {
    if (typeof rating === 'number') {
      return rating.toFixed(1);
    }
    if (typeof rating === 'string') {
      const numRating = parseFloat(rating);
      return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
    }
    return '0.0';
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Not specified';
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold transition-transform hover:scale-105">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.user?.name || 'Lawyer'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">{profile.user?.name?.[0] || 'L'}</span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">
                {profile.user?.name || 'Lawyer Name'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(profile.availabilityStatus)}`}>
                  {getAvailabilityText(profile.availabilityStatus)}
                </span>
                {profile.verified && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <span className="text-amber-500 dark:text-amber-400">★</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatRating(profile.rating)}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">({profile.casesHandled} cases)</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-1">
            {profile.specializations.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full border border-gray-200 dark:border-gray-700 transition-colors"
              >
                {spec}
              </span>
            ))}
            {profile.specializations.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs rounded-full border border-gray-200 dark:border-gray-800 transition-colors">
                +{profile.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Experience & Location */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Experience:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white transition-colors">{profile.yearsExperience} years</span>
          </div>
        </div>

        {/* Service Areas */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Areas</h4>
          <div className="flex flex-wrap gap-1">
            {profile.serviceAreas.slice(0, 2).map((area, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 text-xs rounded-full border border-amber-100 dark:border-amber-900/30 transition-colors"
              >
                {area}
              </span>
            ))}
            {profile.serviceAreas.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs rounded-full border border-gray-200 dark:border-gray-800 transition-colors">
                +{profile.serviceAreas.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Languages</h4>
          <div className="flex flex-wrap gap-1">
            {profile.languages.slice(0, 3).map((lang, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700 transition-colors"
              >
                {lang}
              </span>
            ))}
            {profile.languages.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs rounded-full border border-gray-200 dark:border-gray-800 transition-colors">
                +{profile.languages.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Hourly Rate:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white transition-colors">{formatPrice(profile.hourlyRate)}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Consultation:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white transition-colors">{formatPrice(profile.consultationFee)}</span>
          </div>
        </div>

        {/* Bio Preview */}
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 transition-colors">
            {profile.bio}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors">
          <Button
            variant="secondary"
            onClick={handleViewProfile}
            className="flex-1"
          >
            View Profile
          </Button>
          {showContactButton && (
            <Button
              onClick={handleContact}
              className="flex-1"
              disabled={profile.availabilityStatus === 'unavailable'}
            >
              {profile.availabilityStatus === 'unavailable' ? 'Unavailable' : 'Contact'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
