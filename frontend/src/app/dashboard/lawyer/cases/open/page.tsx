'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../../../components/Card';
import { CasesTable } from '../../../../../components/CasesTable';
import { getCases, type Case } from '../../../../../lib/cases';
import Button from '../../../../../components/Button';

export default function LawyerOpenCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    urgency: '',
    location: ''
  });

  useEffect(() => {
    fetchOpenCases();
  }, [filters]);

  const fetchOpenCases = async () => {
    try {
      setLoading(true);
      const casesData = await getCases({ 
        open: true, 
        status: 'pending',
        ...filters
      });
      setCases(casesData);
    } catch (error) {
      console.error('Error fetching open cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = (caseId: number) => {
    router.push(`/dashboard/lawyer/cases/${caseId}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      urgency: '',
      location: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Open Cases</h1>
        <p className="text-gray-600">
          Browse available cases and submit proposals to help citizens with their legal issues
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Cases</h3>
          <Button onClick={clearFilters} variant="outline" size="sm">
            Clear Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="criminal">Criminal</option>
              <option value="civil">Civil</option>
              <option value="family">Family</option>
              <option value="corporate">Corporate</option>
              <option value="property">Property</option>
              <option value="employment">Employment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency
            </label>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange('urgency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Urgency Levels</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="Enter city or location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Cases Table */}
      <Card className="p-6">
        {cases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No open cases found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.category || filters.urgency || filters.location 
                ? 'Try adjusting your filters.' 
                : 'There are currently no open cases available.'}
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {cases.length} open case{cases.length !== 1 ? 's' : ''}
              </p>
            </div>
            <CasesTable 
              cases={cases} 
              onViewCase={handleViewCase}
              userRole="lawyer"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
