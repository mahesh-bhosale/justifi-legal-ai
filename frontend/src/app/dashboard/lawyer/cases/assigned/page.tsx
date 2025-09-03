'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../../../components/Card';
import { CasesTable } from '../../../../../components/CasesTable';
import { getCases, type Case } from '../../../../../lib/cases';
import Button from '../../../../../components/Button';

export default function LawyerAssignedCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchAssignedCases();
  }, [filters]);

  const fetchAssignedCases = async () => {
    try {
      setLoading(true);
      // Get cases where the current lawyer is assigned
      const casesData = await getCases({ 
        ...filters
      });
      setCases(casesData);
    } catch (error) {
      console.error('Error fetching assigned cases:', error);
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
      status: '',
      category: ''
    });
  };

  const getStatusCounts = () => {
    const counts = {
      in_progress: 0,
      resolved: 0,
      closed: 0
    };
    
    cases.forEach(caseItem => {
      if (counts.hasOwnProperty(caseItem.status)) {
        counts[caseItem.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

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
        <h1 className="text-2xl font-bold text-gray-900">My Assigned Cases</h1>
        <p className="text-gray-600">
          Manage the cases you're currently handling and track their progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.in_progress}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.resolved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.closed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Cases</h3>
          <Button onClick={clearFilters} variant="outline" size="sm">
            Clear Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
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
        </div>
      </Card>

      {/* Cases Table */}
      <Card className="p-6">
        {cases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assigned cases found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status || filters.category 
                ? 'Try adjusting your filters.' 
                : 'You don\'t have any assigned cases yet. Browse open cases to submit proposals.'}
            </p>
            {!filters.status && !filters.category && (
              <div className="mt-6">
                <Button 
                  onClick={() => router.push('/dashboard/lawyer/cases/open')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Browse Open Cases
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {cases.length} assigned case{cases.length !== 1 ? 's' : ''}
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
