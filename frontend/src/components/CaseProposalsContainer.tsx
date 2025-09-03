'use client';

import { useEffect, useState, useCallback } from 'react';
import { CaseProposalsList } from './CaseProposalsList';
import {
  type CaseProposal,
  getCaseProposals,
  updateProposalStatus,
  withdrawProposal,
} from '@/lib/proposals';

interface CaseProposalsContainerProps {
  caseId: number;
  userRole: 'citizen' | 'lawyer' | 'admin';
  onProposalUpdate?: () => void;
}

export function CaseProposalsContainer({
  caseId,
  userRole,
  onProposalUpdate,
}: CaseProposalsContainerProps) {
  const [proposals, setProposals] = useState<CaseProposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCaseProposals(caseId);
      setProposals(data);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleAccept = async (proposalId: number) => {
    await updateProposalStatus(proposalId, 'accepted');
    await fetchProposals();
    onProposalUpdate?.();
  };

  const handleReject = async (proposalId: number) => {
    await updateProposalStatus(proposalId, 'rejected');
    await fetchProposals();
    onProposalUpdate?.();
  };

  const handleWithdraw = async (proposalId: number) => {
    await withdrawProposal(proposalId);
    await fetchProposals();
    onProposalUpdate?.();
  };

  // TODO: Replace with actual current user id from auth once available
  const currentUserId = '';

  return (
    <CaseProposalsList
      proposals={proposals}
      onAccept={handleAccept}
      onReject={handleReject}
      onWithdraw={userRole === 'lawyer' ? handleWithdraw : undefined}
      userRole={userRole}
      currentUserId={currentUserId}
      isLoading={loading}
    />
  );
}


