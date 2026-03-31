'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { lawyerProfileApi, type LawyerProfile } from '@/lib/lawyer-profiles';
import LawyerProfileForm from '@/components/LawyerProfileForm';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/profile';

export default function LawyerProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await lawyerProfileApi.getMyProfile();
      if (response.success) {
        setProfile(response.data);
        if (response.data.user?.name) {
          setName(response.data.user.name);
        }
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } };
      if (errorObj.response?.status === 404) {
        // Profile doesn't exist yet
        setProfile(null);
      } else {
        setError(errorObj.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSuccess = (updatedProfile: LawyerProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    setNameSaving(true);
    setNameError(null);
    try {
      const res = await profileApi.updateProfile({ name: name.trim() });
      if (res.success) {
        setUser({
          ...(user || {
            id: res.data.id,
            email: res.data.email,
            role: res.data.role,
          }),
          name: res.data.name,
        });
      } else {
        setNameError(res.message || 'Failed to update name');
      }
    } catch (err: any) {
      setNameError(err?.response?.data?.message || 'Failed to update name');
    } finally {
      setNameSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={loadProfile}>Try Again</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show form if no profile exists or if editing
  if (!profile || isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard/lawyer')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile ? 'Edit Profile' : 'Create Your Profile'}
            </h1>
          </div>

          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Account Name</h2>
            <p className="text-sm text-gray-500 mb-3">
              This name is shown in search results, your public profile, and the dashboard
              navbar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-600">
                    {nameError}
                  </p>
                )}
              </div>
              <Button onClick={handleSaveName} disabled={nameSaving}>
                {nameSaving ? 'Saving...' : 'Save Name'}
              </Button>
            </div>
          </Card>

          <LawyerProfileForm
            initialData={profile ? {
              specializations: profile.specializations,
              yearsExperience: profile.yearsExperience,
              bio: profile.bio,
              officeAddress: profile.officeAddress,
              serviceAreas: profile.serviceAreas,
              languages: profile.languages,
              education: profile.education,
              barAdmissions: profile.barAdmissions,
              hourlyRate: profile.hourlyRate,
              consultationFee: profile.consultationFee,
              availabilityStatus: profile.availabilityStatus
            } : undefined}
            profileId={profile?.id}
            onSuccess={handleProfileSuccess}
            onCancel={profile ? handleCancel : undefined}
          />
        </div>
      </div>
    );
  }

  // Show profile view
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/dashboard/lawyer')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <Button onClick={handleEdit}>
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {profile.user?.name || user?.name || 'Lawyer'}
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(profile.availabilityStatus)}`}>
                        {getAvailabilityText(profile.availabilityStatus)}
                      </span>
                      {profile.verified && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400 text-xl">★</span>
                      <span className="text-2xl font-bold">{formatRating(profile.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {profile.casesHandled} cases handled
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <span className="ml-2 font-medium">{profile.yearsExperience} years</span>
                  </div>
                  {/* <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="ml-2 font-medium">{profile.successRate}%</span>
                  </div> */}
                </div>
              </div>
            </Card>

            {/* Bio */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </Card>

            {/* Specializations */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </Card>

            {/* Service Areas */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Areas</h3>
              <div className="flex flex-wrap gap-2">
                {profile.serviceAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </Card>

            {/* Languages */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              <div className="space-y-3">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.university}</p>
                    <p className="text-sm text-gray-500">
                      {edu.year} {edu.field && `• ${edu.field}`}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Bar Admissions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bar Admissions</h3>
              <div className="space-y-3">
                {profile.barAdmissions.map((bar, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-gray-900">{bar.state}</h4>
                    <p className="text-sm text-gray-500">
                      Admitted {bar.year}
                      {bar.barNumber && ` • Bar Number: ${bar.barNumber}`}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Office Address</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {profile.officeAddress}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <span className="text-gray-500 text-sm">Hourly Rate:</span>
                    <p className="font-medium">{formatPrice(profile.hourlyRate)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Consultation Fee:</span>
                    <p className="font-medium">{formatPrice(profile.consultationFee)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating:</span>
                  <span className="font-medium">{formatRating(profile.rating)}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cases Handled:</span>
                  <span className="font-medium">{profile.casesHandled}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-500">Success Rate:</span>
                  <span className="font-medium">{profile.successRate}%</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-500">Experience:</span>
                  <span className="font-medium">{profile.yearsExperience} years</span>
                </div>
              </div>
            </Card>

            {/* Profile Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member since:</span>
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last updated:</span>
                  <span>{new Date(profile.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${getAvailabilityColor(profile.availabilityStatus)}`}>
                    {getAvailabilityText(profile.availabilityStatus)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
