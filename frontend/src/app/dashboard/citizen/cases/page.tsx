'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../../components/Card';
import { CasesTable } from '../../../../components/CasesTable';
import { getCases, type Case } from '../../../../lib/cases';
import Button from '../../../../components/Button';

export default function CitizenCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    open: undefined as boolean | undefined
  });

  useEffect(() => {
    fetchCases();
  }, [filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const casesData = await getCases(filters);
      setCases(casesData);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = () => {
    router.push('/dashboard/citizen/cases/new');
  };

  const handleViewCase = (caseId: number) => {
    router.push(`/dashboard/citizen/cases/${caseId}`);
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 dark:border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Cases</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your legal cases</p>
        </div>
        <Button onClick={handleCreateCase} className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-400">
          Create New Case
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick status</p>
          <div className="flex flex-wrap gap-2">
            {[
              { v: '', label: 'All' },
              { v: 'pending', label: 'Pending' },
              { v: 'pending_lawyer_acceptance', label: 'Awaiting lawyer' },
              { v: 'in_progress', label: 'In progress' },
              { v: 'resolved', label: 'Resolved' },
              { v: 'closed', label: 'Closed' },
              { v: 'rejected', label: 'Rejected' },
            ].map((chip) => (
              <button
                key={chip.v || 'all'}
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, status: chip.v || '' }));
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  (filters.status || '') === chip.v
                    ? 'bg-yellow-600 dark:bg-yellow-500 text-white dark:text-gray-950 border-yellow-600 dark:border-yellow-500'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 dark:focus:ring-yellow-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="pending_lawyer_acceptance">Awaiting lawyer</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 dark:focus:ring-yellow-500"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Case Type
            </label>
            <select
              value={filters.open === undefined ? '' : filters.open ? 'open' : 'closed'}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('open', value === 'open' ? true : value === 'closed' ? false : undefined);
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 dark:focus:ring-yellow-500"
            >
              <option value="">All Cases</option>
              <option value="open">Open Cases</option>
              <option value="closed">Closed Cases</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Cases Table */}
      <Card className="p-6">
        {cases.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No cases found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filters.status || filters.category || filters.open !== undefined 
                ? 'Try adjusting your filters.' 
                : 'Get started by creating your first case.'}
            </p>
            {!filters.status && !filters.category && filters.open === undefined && (
              <div className="mt-6">
                <Button onClick={handleCreateCase} className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-400">
                  Create Case
                </Button>
              </div>
            )}
          </div>
        ) : (
          <CasesTable 
            cases={cases} 
            onViewCase={handleViewCase}
            userRole="citizen"
          />
        )}
      </Card>
    </div>
  );
}
