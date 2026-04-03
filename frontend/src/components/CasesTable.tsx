'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Case } from '@/lib/cases';
import Button from './Button';
import Card from './Card';

interface CasesTableProps {
  cases: Case[];
  userRole: 'citizen' | 'lawyer' | 'admin';
  onStatusChange?: (caseId: number, status: string) => void;
  onViewCase?: (caseId: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-500';
    case 'pending_lawyer_acceptance':
      return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-500';
    case 'in_progress':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
    case 'resolved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    case 'closed':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'pending_lawyer_acceptance':
      return 'Awaiting Lawyer';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'low':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500';
    case 'high':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount?: number) => {
  if (!amount) return 'Not specified';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export function CasesTable({ cases, userRole, onStatusChange, onViewCase }: CasesTableProps) {
  const [sortField, setSortField] = useState<keyof Case>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Case) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCases = [...cases].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const SortableHeader = ({ field, children }: { field: keyof Case; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded px-2 py-1"
    >
      <span>{children}</span>
      {sortField === field && (
        <span className="text-yellow-600 dark:text-yellow-500">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  if (cases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2 text-gray-900 dark:text-white">No cases found</p>
          <p className="text-sm">
            {userRole === 'citizen' 
              ? 'Create your first case to get started'
              : 'No cases are currently available'
            }
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortableHeader field="title">Case</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortableHeader field="category">Category</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortableHeader field="status">Status</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortableHeader field="urgency">Urgency</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortableHeader field="budget">Budget</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <SortableHeader field="createdAt">Created</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedCases.map((caseItem) => (
              <tr key={caseItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/${userRole}/cases/${caseItem.id}`}
                      className="text-sm font-medium text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400"
                    >
                      {caseItem.title}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {caseItem.description}
                    </p>
                    {caseItem.location && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        📍 {caseItem.location}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-white">{caseItem.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full items-center justify-center ${getStatusColor(caseItem.status)}`}>
                    {getStatusLabel(caseItem.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full items-center justify-center ${getUrgencyColor(caseItem.urgency)}`}>
                    {caseItem.urgency}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatCurrency(caseItem.budget)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(caseItem.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/${userRole}/cases/${caseItem.id}`}
                      className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 focus:outline-none"
                    >
                      View
                    </Link>
                    {userRole === 'citizen' &&
                      (caseItem.status === 'pending' || caseItem.status === 'pending_lawyer_acceptance') && (
                      <Link
                        href={`/dashboard/${userRole}/cases/${caseItem.id}?edit=1`}
                        className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 focus:outline-none"
                      >
                        Edit
                      </Link>
                    )}
                    {userRole === 'citizen' &&
                      (caseItem.status === 'pending' || caseItem.status === 'pending_lawyer_acceptance') &&
                      !caseItem.lawyerId && (
                        <Link
                          href={`/dashboard/${userRole}/cases/${caseItem.id}?withdraw=1`}
                          className="text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 focus:outline-none"
                        >
                          Withdraw
                        </Link>
                      )}
                    {userRole === 'lawyer' && caseItem.status === 'pending' && !caseItem.lawyerId && (
                      <Link
                        href={`/dashboard/lawyer/cases/${caseItem.id}`}
                        className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 focus:outline-none"
                      >
                        Submit Proposal
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
