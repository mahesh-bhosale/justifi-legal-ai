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
        return 'text-green-600 bg-green-100';
      case 'limited':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
    return `$${price.toLocaleString()}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {profile.user?.name || 'Lawyer Name'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(profile.availabilityStatus)}`}>
                {getAvailabilityText(profile.availabilityStatus)}
              </span>
              {profile.verified && (
                <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                  Verified
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="font-medium">{formatRating(profile.rating)}</span>
              <span className="text-gray-500 text-sm">({profile.casesHandled} cases)</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-1">
            {profile.specializations.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {spec}
              </span>
            ))}
            {profile.specializations.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{profile.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Experience & Location */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Experience:</span>
            <span className="ml-1 font-medium">{profile.yearsExperience} years</span>
          </div>
          <div>
            <span className="text-gray-500">Success Rate:</span>
            <span className="ml-1 font-medium">{profile.successRate}%</span>
          </div>
        </div>

        {/* Service Areas */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Service Areas</h4>
          <div className="flex flex-wrap gap-1">
            {profile.serviceAreas.slice(0, 2).map((area, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {area}
              </span>
            ))}
            {profile.serviceAreas.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{profile.serviceAreas.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Languages</h4>
          <div className="flex flex-wrap gap-1">
            {profile.languages.slice(0, 3).map((lang, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
              >
                {lang}
              </span>
            ))}
            {profile.languages.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{profile.languages.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Hourly Rate:</span>
            <span className="ml-1 font-medium">{formatPrice(profile.hourlyRate)}</span>
          </div>
          <div>
            <span className="text-gray-500">Consultation:</span>
            <span className="ml-1 font-medium">{formatPrice(profile.consultationFee)}</span>
          </div>
        </div>

        {/* Bio Preview */}
        <div>
          <p className="text-gray-600 text-sm line-clamp-3">
            {profile.bio}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
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
