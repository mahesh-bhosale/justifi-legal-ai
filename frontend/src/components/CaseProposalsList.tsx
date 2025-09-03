'use client';

import { useState } from 'react';
import { CaseProposal } from '@/lib/proposals';
import Button from './Button';
import Card from './Card';

interface CaseProposalsListProps {
  proposals: CaseProposal[];
  onAccept: (proposalId: number) => void;
  onReject: (proposalId: number) => void;
  onWithdraw?: (proposalId: number) => void;
  userRole: 'citizen' | 'lawyer' | 'admin';
  currentUserId: string;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount?: number) => {
  if (!amount) return 'Not specified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function CaseProposalsList({
  proposals,
  onAccept,
  onReject,
  onWithdraw,
  userRole,
  currentUserId,
  isLoading = false,
}: CaseProposalsListProps) {
  const [expandedProposal, setExpandedProposal] = useState<number | null>(null);

  const toggleExpanded = (proposalId: number) => {
    setExpandedProposal(expandedProposal === proposalId ? null : proposalId);
  };

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const otherProposals = proposals.filter(p => p.status !== 'pending');

  if (proposals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <p className="text-lg mb-2">No proposals yet</p>
          <p className="text-sm">
            {userRole === 'citizen' 
              ? 'Lawyers will submit proposals for your case. Check back soon!'
              : 'No proposals have been submitted for this case.'
            }
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Proposals */}
      {pendingProposals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Proposals ({pendingProposals.length})
          </h3>
          <div className="space-y-4">
            {pendingProposals.map((proposal) => (
              <Card key={proposal.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Submitted {formatDate(proposal.createdAt)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Proposed Fee:</span>
                        <p className="text-sm text-gray-900">{formatCurrency(proposal.proposedFee)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Estimated Duration:</span>
                        <p className="text-sm text-gray-900">{proposal.estimatedDuration || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Lawyer ID:</span>
                        <p className="text-sm text-gray-900 font-mono">{proposal.lawyerId}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Proposal:</span>
                      <div className="mt-2">
                        {expandedProposal === proposal.id ? (
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{proposal.proposalText}</p>
                        ) : (
                          <p className="text-sm text-gray-900">
                            {proposal.proposalText.length > 200
                              ? `${proposal.proposalText.substring(0, 200)}...`
                              : proposal.proposalText
                            }
                          </p>
                        )}
                        {proposal.proposalText.length > 200 && (
                          <button
                            onClick={() => toggleExpanded(proposal.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                          >
                            {expandedProposal === proposal.id ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {userRole === 'citizen' && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => onAccept(proposal.id)}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                    >
                      Accept Proposal
                    </Button>
                    <Button
                      onClick={() => onReject(proposal.id)}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                    >
                      Reject Proposal
                    </Button>
                  </div>
                )}

                {userRole === 'lawyer' && proposal.lawyerId === currentUserId && onWithdraw && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => onWithdraw(proposal.id)}
                      disabled={isLoading}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                    >
                      Withdraw Proposal
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Proposals (Accepted, Rejected, Withdrawn) */}
      {otherProposals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Other Proposals ({otherProposals.length})
          </h3>
          <div className="space-y-4">
            {otherProposals.map((proposal) => (
              <Card key={proposal.id} className="p-6 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {proposal.status === 'accepted' ? 'Accepted' : proposal.status === 'rejected' ? 'Rejected' : 'Withdrawn'} on {formatDate(proposal.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Proposed Fee:</span>
                        <p className="text-sm text-gray-900">{formatCurrency(proposal.proposedFee)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Estimated Duration:</span>
                        <p className="text-sm text-gray-900">{proposal.estimatedDuration || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Lawyer ID:</span>
                        <p className="text-sm text-gray-900 font-mono">{proposal.lawyerId}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-700">Proposal:</span>
                      <p className="text-sm text-gray-900 mt-2 line-clamp-3">
                        {proposal.proposalText}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
