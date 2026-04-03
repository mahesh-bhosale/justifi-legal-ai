'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { lawyerProfileApi, type LawyerProfile } from '@/lib/lawyer-profiles';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ReviewList from '@/components/ReviewList';
import { getLawyerReviews, getLawyerReviewStats, type LawyerReviewStats, type Review } from '@/lib/reviews';

export default function LawyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [lawyerReviewStats, setLawyerReviewStats] = useState<LawyerReviewStats | null>(null);
  const [lawyerReviews, setLawyerReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (params.id) {
      loadProfile(Number(params.id));
    }
  }, [params.id]);

  const loadProfile = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await lawyerProfileApi.getProfile(id);
      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      const errorObj = error as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (lawyerUserId: string) => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const [stats, reviews] = await Promise.all([
        getLawyerReviewStats(lawyerUserId),
        getLawyerReviews(lawyerUserId),
      ]);
      setLawyerReviewStats(stats);
      setLawyerReviews(reviews);
    } catch (error: unknown) {
      console.error('Error loading lawyer reviews:', error);
      const errorObj = error as { response?: { data?: { message?: string } } };
      setReviewsError(errorObj.response?.data?.message || 'Failed to load reviews');
      setLawyerReviewStats(null);
      setLawyerReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.userId) {
      void loadReviews(profile.userId);
    }
  }, [profile?.userId]);

  const handleContact = () => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    if (!profile?.userId) return;

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
    return `₹${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 lg:py-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-sm"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-sm"></div>
              </div>
              <div className="space-y-6">
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-sm"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="p-12 text-center shadow-xl border-gray-100 dark:border-gray-800">
            <div className="bg-red-50 dark:bg-red-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Profile Unavailable</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {error || 'The lawyer profile you are looking for does not exist or has been removed.'}
            </p>
            <Button 
              onClick={() => router.push('/lawyers')}
              className="px-8"
            >
              Return to Search
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const getAvailabilityStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800/50';
      case 'limited':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-800/50';
      case 'unavailable':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/50';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 lg:py-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 lg:mb-10">
          <div className="flex flex-col gap-4">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="self-start px-4 py-2 text-sm border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-gray-300"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to search
            </Button>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight border-l-4 border-amber-600 dark:border-amber-500 pl-6">
              Lawyer Profile
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${getAvailabilityStyle(profile.availabilityStatus)}`}>
                {getAvailabilityText(profile.availabilityStatus)}
              </span>
            </div>
            {profile.verified && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Verification</p>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/50">
                  ✓ Verified
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info & Identity */}
            <Card className="p-0 overflow-hidden border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="h-32 bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-900"></div>
              <div className="px-8 pb-8 -mt-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex items-end gap-6">
                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-4 border-white dark:border-gray-800 flex items-center justify-center text-4xl overflow-hidden transition-transform hover:scale-105">
                      {profile.avatarUrl ? (
                        <img 
                          src={profile.avatarUrl} 
                          alt={profile.user?.name || 'Lawyer'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {profile.user?.name?.[0] || 'L'}
                        </span>
                      )}
                    </div>
                    <div className="pb-1">
                      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {profile.user?.name || 'Lawyer Name'}
                      </h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center text-amber-500">
                          <span className="text-xl mr-1">★</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{formatRating(profile.rating)}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-700 pl-4 uppercase tracking-wider">
                          {profile.casesHandled} cases handled
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center min-w-[100px]">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Experience</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{profile.yearsExperience}+ Years</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Bio */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                Professional Biography
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                {profile.bio || "This professional has not provided a biography yet."}
              </p>
            </Card>

            {/* Expertise & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specializations */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  {profile.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-500 border border-amber-200/50 dark:border-amber-900/20 rounded-lg font-bold tracking-tight"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Service Areas */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                   <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Service Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.serviceAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold tracking-tight"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Languages */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827-5.802M10.887 7L12 3M7.051 19c.647-.114 1.23-.3 1.715-.557m5.287-3.102L18 9l-2.206-.735M7 19l4-4.7s.497-1.318 1.532-1.222C13.567 13.174 15 14 15 14" />
                </svg>
                Languages Spoken
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/20 rounded-xl text-sm font-bold uppercase tracking-wider"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {lang}
                  </div>
                ))}
              </div>
            </Card>

            {/* Credentials Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Education */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                  Academic Background
                </h3>
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-600 before:to-transparent before:rounded-full">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">{edu.degree}</h4>
                      <p className="text-gray-600 dark:text-gray-400 font-bold text-sm uppercase tracking-wide">{edu.university}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-black px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                          CLASS OF {edu.year}
                        </span>
                        {edu.field && (
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">• {edu.field}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Bar Admissions */}
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Jurisdictional Bar
                </h3>
                <div className="space-y-6">
                  {profile.barAdmissions.map((bar, index) => (
                    <div key={index} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-green-600 before:to-transparent before:rounded-full">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">{bar.state} Bar Association</h4>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          Admitted in {bar.year}
                        </span>
                        {bar.barNumber && (
                          <div className="inline-flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-500 rounded uppercase border border-green-200/50 dark:border-green-800/30">
                              LICENSE ID: {bar.barNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Action & Contact Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-xl p-8 relative overflow-hidden bg-white dark:bg-gray-900">
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-600/5 rounded-full blur-3xl"></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                Professional Engagement
              </h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Headquarters</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-bold leading-relaxed">
                    {profile.officeAddress || "Address provided upon contact."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2 block">Hourly Rate</span>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(profile.hourlyRate)}</p>
                  </div>
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2 block">Consultation</span>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{formatPrice(profile.consultationFee)}</p>
                  </div>
                </div>

                <Button
                  onClick={handleContact}
                  className="w-full py-4 rounded-xl text-lg font-bold shadow-lg shadow-amber-600/10"
                  disabled={profile.availabilityStatus === 'unavailable'}
                >
                  {profile.availabilityStatus === 'unavailable' 
                    ? 'Currently Unavailable' 
                    : <span className="flex items-center justify-center gap-2">Initiate Contact <Send className="w-5 h-5" /></span>
                  }
                </Button>
                
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center uppercase font-bold tracking-widest">
                  Secure encrypted communication protocol
                </p>
              </div>
            </Card>

            {/* Key Outcomes Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Outcome Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Public Rating</span>
                  <span className="font-black text-gray-900 dark:text-white">{formatRating(profile.rating)} / 5.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Portfolio</span>
                  <span className="font-black text-gray-900 dark:text-white">{profile.casesHandled} Resolved</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Tenure</span>
                  <span className="font-black text-gray-900 dark:text-white">{profile.yearsExperience} Fiscal Years</span>
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <div className="relative">
              {reviewsLoading ? (
                <Card className="p-12 text-center border-gray-100 dark:border-gray-800 shadow-inner">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Retrieving Testimonials...</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviewsError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium">
                      Failed to sync testimonials: {reviewsError}
                    </div>
                  )}
                  <ReviewList stats={lawyerReviewStats} reviews={lawyerReviews} />
                </div>
              )}
            </div>

            {/* Immutable Registry Data */}
            <Card className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-600 mb-4 uppercase tracking-[0.3em]">Registry Signature</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase">Commencement</span>
                  <span className="text-[10px] font-black text-gray-900 dark:text-gray-300">{new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase">Latest Revision</span>
                  <span className="text-[10px] font-black text-gray-900 dark:text-gray-300">{new Date(profile.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase">Verification Status</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${profile.verified ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400'}`}>
                    {profile.verified ? 'Institutional Integrity Confirmed' : 'Pending Verification'}
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

const Send = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
