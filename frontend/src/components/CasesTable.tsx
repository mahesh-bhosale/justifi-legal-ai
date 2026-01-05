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
      return 'bg-yellow-100 text-yellow-800';
    case 'pending_lawyer_acceptance':
      return 'bg-orange-100 text-orange-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
      className="flex items-center space-x-1 font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
    >
      <span>{children}</span>
      {sortField === field && (
        <span className="text-blue-600">
          {sortDirection === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  if (cases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg mb-2">No cases found</p>
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="title">Case</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="category">Category</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="status">Status</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="urgency">Urgency</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="budget">Budget</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader field="createdAt">Created</SortableHeader>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCases.map((caseItem) => (
              <tr key={caseItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/${userRole}/cases/${caseItem.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      {caseItem.title}
                    </Link>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {caseItem.description}
                    </p>
                    {caseItem.location && (
                      <p className="text-xs text-gray-400">
                        📍 {caseItem.location}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{caseItem.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                    {getStatusLabel(caseItem.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(caseItem.urgency)}`}>
                    {caseItem.urgency}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(caseItem.budget)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(caseItem.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/${userRole}/cases/${caseItem.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    {userRole === 'citizen' && caseItem.status === 'pending' && (
                      <Link
                        href={`/dashboard/${userRole}/cases/${caseItem.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                    )}
                    {userRole === 'lawyer' && caseItem.status === 'pending' && !caseItem.lawyerId && (
                      <Link
                        href={`/dashboard/lawyer/cases/${caseItem.id}`}
                        className="text-purple-600 hover:text-purple-900"
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
