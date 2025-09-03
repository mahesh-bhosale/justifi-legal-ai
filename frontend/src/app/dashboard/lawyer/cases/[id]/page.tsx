'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '../../../../../components/Card';
import { SubmitProposalForm } from '../../../../../components/SubmitProposalForm';
import { CaseMessagesContainer } from '../../../../../components/CaseMessagesContainer';
import { getCaseById, type Case } from '../../../../../lib/cases';
import { createProposal, getCaseProposals, type CreateProposalInput, type CaseProposal } from '../../../../../lib/proposals';
import Button from '../../../../../components/Button';

export default function LawyerCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = parseInt(params.id as string);
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposal' | 'proposals' | 'messages' | 'documents'>('overview');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);
  const [proposals, setProposals] = useState<CaseProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  useEffect(() => {
    if (caseId) {
      fetchCase();
      fetchProposals();
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

  const fetchProposals = async () => {
    try {
      setLoadingProposals(true);
      const data = await getCaseProposals(caseId);
      setProposals(data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleBackToCases = () => {
    router.push('/dashboard/lawyer/cases/open');
  };

  const handleTabChange = (tab: 'overview' | 'proposal' | 'proposals' | 'messages' | 'documents') => {
    setActiveTab(tab);
    // Clear messages when changing tabs
    setProposalError(null);
    setProposalSuccess(null);
  };

  const handleProposalSubmitted = async (data: CreateProposalInput) => {
    try {
      setSubmittingProposal(true);
      setProposalError(null);
      setProposalSuccess(null);
      
      await createProposal(caseId, data);
      
      // Refresh proposals to show the newly submitted one
      await fetchProposals();
      
      // Set success message and stay on proposal tab to show the submitted proposal
      setProposalSuccess('Proposal submitted successfully! The citizen will review it and get back to you.');
      setActiveTab('proposal');
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      setProposalError(error.response?.data?.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setSubmittingProposal(false);
    }
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

  // Check if current lawyer has already submitted a proposal
  const getCurrentLawyerProposal = () => {
    // This would need to get the current lawyer's ID from auth context
    // For now, we'll check if there are any proposals
    // In a real app, you'd compare p.lawyerId with the current user's ID
    return proposals.find(p => p.status === 'pending' || p.status === 'accepted' || p.status === 'rejected');
  };

  const hasSubmittedProposal = getCurrentLawyerProposal() !== undefined;
  const currentProposal = getCurrentLawyerProposal();

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
        <p className="text-gray-500">The case you're looking for doesn't exist.</p>
        <Button onClick={handleBackToCases} className="mt-4">
          Back to Cases
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'proposal', label: hasSubmittedProposal ? 'My Proposal' : 'Submit Proposal', icon: '💼' },
    { id: 'proposals', label: 'All Proposals', icon: '📊' },
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
            ← Back to Open Cases
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
              onClick={() => handleTabChange(tab.id as any)}
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
                      {caseData.budget ? `$${caseData.budget}` : 'Not specified'}
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
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-4">
                {hasSubmittedProposal ? (
                  <Button 
                    onClick={() => handleTabChange('proposal')}
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  >
                    ✓ View Proposal
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleTabChange('proposal')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Proposal
                  </Button>
                )}
                <Button 
                  onClick={() => handleTabChange('messages')}
                  variant="outline"
                >
                  View Messages
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'proposal' && (
          <Card className="p-6">
            {loadingProposals ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : proposalSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 text-green-500 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Proposal Submitted Successfully!</h3>
                <p className="text-gray-600 mb-4">{proposalSuccess}</p>
                <Button 
                  onClick={() => {
                    setProposalSuccess(null);
                    fetchProposals();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View My Proposal
                </Button>
              </div>
            ) : hasSubmittedProposal ? (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 text-green-500 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Proposal Submitted</h3>
                <p className="text-gray-600 mb-4">
                  You have already submitted a proposal for this case. The citizen will review it and get back to you.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-left">
                  <h4 className="font-medium text-blue-900 mb-2">Your Proposal Status</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>Status:</strong> {currentProposal?.status === 'pending' ? 'Pending Review' : currentProposal?.status?.toUpperCase()}</p>
                    <p><strong>Submitted:</strong> {new Date(currentProposal?.createdAt || '').toLocaleDateString()}</p>
                    {currentProposal?.proposedFee && (
                      <p><strong>Proposed Fee:</strong> ${currentProposal.proposedFee}</p>
                    )}
                    {currentProposal?.estimatedDuration && (
                      <p><strong>Estimated Duration:</strong> {currentProposal.estimatedDuration}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Submit Your Proposal</h3>
                  <p className="text-gray-600">
                    Provide a detailed proposal explaining how you can help with this case.
                  </p>
                </div>
                
                {proposalError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{proposalError}</p>
                  </div>
                )}
                
                <SubmitProposalForm
                  caseId={caseId}
                  onSubmit={handleProposalSubmitted}
                  isLoading={submittingProposal}
                />
              </>
            )}
          </Card>
        )}

        {activeTab === 'proposals' && (
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Proposals</h3>
              <p className="text-gray-600">
                View all proposals submitted for this case.
              </p>
            </div>
            
            {loadingProposals ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Be the first to submit a proposal for this case.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {proposal.status.toUpperCase()}
                        </span>
                        {proposal.lawyerId === currentProposal?.lawyerId && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            YOURS
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-900 mb-3">{proposal.proposalText}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {proposal.proposedFee && (
                        <span><strong>Fee:</strong> ${proposal.proposedFee}</span>
                      )}
                      {proposal.estimatedDuration && (
                        <span><strong>Duration:</strong> {proposal.estimatedDuration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'messages' && (
          <CaseMessagesContainer 
            caseId={caseId}
            userRole="lawyer"
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
