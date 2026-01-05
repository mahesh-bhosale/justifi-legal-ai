'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../components/Card';
import Link from 'next/link';
import Button from '../../../components/Button';
import { getDirectContactRequests, acceptDirectContact, rejectDirectContact, type Case } from '../../../lib/cases';

export default function LawyerDashboard() {
  const router = useRouter();
  const [directRequests, setDirectRequests] = useState<Case[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDirectRequests();
  }, []);

  const fetchDirectRequests = async () => {
    try {
      setLoadingRequests(true);
      const requests = await getDirectContactRequests();
      setDirectRequests(requests);
    } catch (error) {
      console.error('Error fetching direct contact requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAccept = async (caseId: number) => {
    try {
      setProcessingId(caseId);
      await acceptDirectContact(caseId);
      alert('Case accepted! You can now communicate with the client.');
      fetchDirectRequests();
      router.push(`/dashboard/lawyer/cases/${caseId}`);
    } catch (error: any) {
      console.error('Error accepting case:', error);
      alert(error.response?.data?.message || 'Failed to accept case');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (caseId: number) => {
    if (!confirm('Are you sure you want to reject this case request?')) {
      return;
    }

    try {
      setProcessingId(caseId);
      await rejectDirectContact(caseId);
      alert('Case request rejected. The citizen has been notified.');
      fetchDirectRequests();
    } catch (error: any) {
      console.error('Error rejecting case:', error);
      alert(error.response?.data?.message || 'Failed to reject case');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      pending_lawyer_acceptance: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      in_progress: { text: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
      resolved: { text: 'Resolved', className: 'bg-green-100 text-green-800' },
      closed: { text: 'Closed', className: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.text}
      </span>
    );
  };
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Lawyer Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your cases, review AI-generated documents, and provide legal expertise to clients.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">42</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">127</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Direct Contact Requests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Direct Contact Requests</h3>
          {!loadingRequests && directRequests.length > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              {directRequests.length} New
            </span>
          )}
        </div>
        
        {loadingRequests ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : directRequests.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No direct contact requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              When citizens contact you directly, their case requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {directRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {request.category}</span>
                      <span>Urgency: {request.urgency}</span>
                      {request.location && <span>Location: {request.location}</span>}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Received: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleAccept(request.id)}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingId === request.id ? 'Processing...' : 'Accept'}
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      variant="secondary"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Review AI Documents</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium">Client Management</span>
              </div>
            </button>
            <Link href="/dashboard/lawyer/profile" className="block">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Manage Profile</span>
                </div>
              </button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>Document review completed - Case #5678</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>New client consultation scheduled</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span>AI document pending review</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span>Case #9012 closed successfully</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
