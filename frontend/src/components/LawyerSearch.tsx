'use client';

import { useState, useEffect, useCallback } from 'react';
import { lawyerProfileApi, type LawyerProfile, type LawyerProfileFilters } from '@/lib/lawyer-profiles';
import LawyerCard from './LawyerCard';
import Button from './Button';
import Card from './Card';

interface LawyerSearchProps {
  onViewProfile?: (profile: LawyerProfile) => void;
  onContact?: (profile: LawyerProfile) => void;
  showContactButton?: boolean;
}

export default function LawyerSearch({ 
  onViewProfile, 
  onContact, 
  showContactButton = true 
}: LawyerSearchProps) {
  const [profiles, setProfiles] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LawyerProfileFilters>({});
  
  // Available options
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [availableServiceAreas, setAvailableServiceAreas] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  const loadOptions = async () => {
    try {
      const [specializationsRes, serviceAreasRes, languagesRes] = await Promise.all([
        lawyerProfileApi.getSpecializations(),
        lawyerProfileApi.getServiceAreas(),
        lawyerProfileApi.getLanguages()
      ]);

      setAvailableSpecializations(specializationsRes.data);
      setAvailableServiceAreas(serviceAreasRes.data);
      setAvailableLanguages(languagesRes.data);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const searchProfiles = useCallback(async (searchFilters?: LawyerProfileFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await lawyerProfileApi.getProfiles(searchFilters || filters);
      if (response.success) {
        setProfiles(response.data);
      } else {
        setError(response.message || 'Failed to load profiles');
      }
    } catch (error: unknown) {
      console.error('Error searching profiles:', error);
      const errorObj = error as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Failed to search profiles');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOptions();
    searchProfiles();
  }, [searchProfiles]);

  const handleFilterChange = (key: keyof LawyerProfileFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterChange = (key: 'specializations' | 'serviceAreas' | 'languages', value: string[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    searchProfiles({});
  };

  const applyFilters = () => {
    searchProfiles(filters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProfiles(filters);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search lawyers by name, specialization, or bio..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="secondary" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {availableSpecializations.map((spec) => (
                    <label key={spec} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.specializations?.includes(spec) || false}
                        onChange={(e) => {
                          const current = filters.specializations || [];
                          if (e.target.checked) {
                            handleArrayFilterChange('specializations', [...current, spec]);
                          } else {
                            handleArrayFilterChange('specializations', current.filter(s => s !== spec));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Areas
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {availableServiceAreas.map((area) => (
                    <label key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.serviceAreas?.includes(area) || false}
                        onChange={(e) => {
                          const current = filters.serviceAreas || [];
                          if (e.target.checked) {
                            handleArrayFilterChange('serviceAreas', [...current, area]);
                          } else {
                            handleArrayFilterChange('serviceAreas', current.filter(a => a !== area));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {availableLanguages.map((lang) => (
                    <label key={lang} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.languages?.includes(lang) || false}
                        onChange={(e) => {
                          const current = filters.languages || [];
                          if (e.target.checked) {
                            handleArrayFilterChange('languages', [...current, lang]);
                          } else {
                            handleArrayFilterChange('languages', current.filter(l => l !== lang));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Range
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min years"
                    value={filters.minExperience || ''}
                    onChange={(e) => handleFilterChange('minExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max years"
                    value={filters.maxExperience || ''}
                    onChange={(e) => handleFilterChange('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Hourly Rate Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate Range
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min rate (₹)"
                    value={filters.minHourlyRate || ''}
                    onChange={(e) => handleFilterChange('minHourlyRate', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max rate (₹)"
                    value={filters.maxHourlyRate || ''}
                    onChange={(e) => handleFilterChange('maxHourlyRate', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availabilityStatus || ''}
                  onChange={(e) => handleFilterChange('availabilityStatus', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={applyFilters} disabled={loading}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {loading ? 'Searching...' : `${profiles.length} Lawyers Found`}
          </h2>
        </div>

        {error && (
          <Card>
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          </Card>
        )}

        {!loading && !error && profiles.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">No lawyers found matching your criteria.</p>
              <Button variant="secondary" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        {!loading && profiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <LawyerCard
                key={profile.id}
                profile={profile}
                onViewProfile={onViewProfile}
                onContact={onContact}
                showContactButton={showContactButton}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
