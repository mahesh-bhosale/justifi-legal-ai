'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '../../../../../components/Card';
import { CaseProposalsContainer } from '../../../../../components/CaseProposalsContainer';
import { CaseMessagesContainer } from '../../../../../components/CaseMessagesContainer';
import { getCaseById, type Case } from '../../../../../lib/cases';
import Button from '../../../../../components/Button';

export default function CitizenCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = parseInt(params.id as string);
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'messages' | 'documents'>('overview');

  useEffect(() => {
    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const data = await getCaseById(caseId);
      setCaseData(data);
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCases = () => {
    router.push('/dashboard/citizen/cases');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Case not found</h3>
        <p className="text-gray-500">The case you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={handleBackToCases} className="mt-4">
          Back to Cases
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'proposals', label: 'Proposals', icon: '💼' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'documents', label: 'Documents', icon: '📄' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button 
            onClick={handleBackToCases}
            variant="outline"
            className="mb-4"
          >
            ← Back to Cases
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
          <p className="text-gray-600">Case ID: #{caseData.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
            {caseData.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(caseData.urgency)}`}>
            {caseData.urgency.toUpperCase()} PRIORITY
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900 capitalize">{caseData.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{caseData.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="text-sm text-gray-900">{caseData.location || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Budget</dt>
                    <dd className="text-sm text-gray-900">
                      {caseData.budget ? `₹${caseData.budget}` : 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred Language</dt>
                    <dd className="text-sm text-gray-900">{caseData.preferredLanguage || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(caseData.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(caseData.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                  {caseData.nextHearingDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Next Hearing</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(caseData.nextHearingDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {caseData.resolution && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Resolution</dt>
                      <dd className="text-sm text-gray-900">{caseData.resolution}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'proposals' && (
          <CaseProposalsContainer 
            caseId={caseId}
            userRole="citizen"
            onProposalUpdate={fetchCase}
          />
        )}

        {activeTab === 'messages' && (
          <CaseMessagesContainer 
            caseId={caseId}
            userRole="citizen"
          />
        )}

        {activeTab === 'documents' && (
          <Card className="p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Document management will be implemented soon.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
