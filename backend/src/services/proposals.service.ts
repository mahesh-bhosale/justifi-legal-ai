import { and, eq, not } from 'drizzle-orm';
import { db } from '../db';
import { caseProposals, cases, type CaseProposal, type Case } from '../models/schema';
import { buildEvent, publishEvent } from './kafka.service';
import { notifyLawyerApplied, notifyLawyerSelected } from './notification-dispatch.service';

export interface CreateProposalInput {
  caseId: number;
  lawyerId: string;
  proposalText: string;
  proposedFee?: number;
  estimatedDuration?: string;
}

class ProposalsService {
  async createProposal(input: CreateProposalInput): Promise<CaseProposal> {
    // Ensure case exists and is not closed/resolved
    const [targetCase] = await db.select().from(cases).where(eq(cases.id, input.caseId)).limit(1);
    if (!targetCase) throw new Error('Case not found');
    if (targetCase.status === 'resolved' || targetCase.status === 'closed') {
      throw new Error('Case not open for proposals');
    }

    const [created] = await db
      .insert(caseProposals)
      .values({
        caseId: input.caseId,
        lawyerId: input.lawyerId,
        proposalText: input.proposalText,
        proposedFee: (input.proposedFee as any) ?? undefined,
        estimatedDuration: input.estimatedDuration,
      })
      .onConflictDoNothing({ target: [caseProposals.caseId, caseProposals.lawyerId] })
      .returning();

    if (!created) {
      throw new Error('Duplicate proposal');
    }

    // Fire-and-forget Kafka event (do not block proposal creation)
    const appliedEvent = buildEvent({
      eventType: 'lawyer_applied_to_case',
      actorId: input.lawyerId,
      caseId: input.caseId,
      payload: {
        caseId: input.caseId,
        citizenId: targetCase.citizenId,
        lawyerId: input.lawyerId,
        proposalId: created.id,
      },
    });
    void publishEvent('proposal-events', appliedEvent).catch((err) => {
      console.error('Kafka publish failed (lawyer_applied_to_case):', err);
    });

    void notifyLawyerApplied({
      citizenId: targetCase.citizenId,
      lawyerId: input.lawyerId,
      caseId: input.caseId,
      proposalId: created.id,
    }).catch((err) => console.error('In-app notifyLawyerApplied failed:', err));

    return created;
  }

  async listForCase(caseId: number, requester: { role: 'citizen' | 'lawyer' | 'admin'; userId: string }): Promise<CaseProposal[]> {
    const [c] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    if (!c) throw new Error('Case not found');

    const canView =
      requester.role === 'admin' ||
      (requester.role === 'citizen' && c.citizenId === requester.userId) ||
      (requester.role === 'lawyer' && (
        c.lawyerId === requester.userId || 
        c.preferredLawyerId === requester.userId ||
        (c.status === 'pending' && !c.lawyerId)
      ));
    if (!canView) throw new Error('Access denied');

    const rows = await db.select().from(caseProposals).where(eq(caseProposals.caseId, caseId));
    return rows;
  }

  async setStatus(
    proposalId: number,
    status: 'accepted' | 'rejected',
    requester: { role: 'citizen'; userId: string }
  ): Promise<{ proposal: CaseProposal; updatedCase?: Case } | null> {
    // Only citizen owner can accept/reject
    // Tx: accept -> set proposal accepted, others rejected, assign case to lawyer + set in_progress
    const result = await db.transaction(async (tx) => {
      const [p] = await tx.select().from(caseProposals).where(eq(caseProposals.id, proposalId)).limit(1);
      if (!p) return null;
      const [c] = await tx.select().from(cases).where(eq(cases.id, p.caseId)).limit(1);
      if (!c) return null;
      if (c.citizenId !== requester.userId) throw new Error('Access denied');

      if (status === 'accepted') {
        // set chosen accepted
        const [accepted] = await tx
          .update(caseProposals)
          .set({ status: 'accepted' as any, updatedAt: new Date() as any })
          .where(eq(caseProposals.id, proposalId))
          .returning();

        // reject others
        await tx
          .update(caseProposals)
          .set({ status: 'rejected' as any, updatedAt: new Date() as any })
          .where(and(eq(caseProposals.caseId, p.caseId), and(eq(caseProposals.status, 'pending' as any), not(eq(caseProposals.id, accepted.id)))))
          .returning();

        // assign case and set in_progress
        const [updatedCase] = await tx
          .update(cases)
          .set({ lawyerId: p.lawyerId, status: 'in_progress' as any, updatedAt: new Date() as any })
          .where(eq(cases.id, p.caseId))
          .returning();

        // Fire-and-forget Kafka event (do not block accept flow)
        const selectedEvent = buildEvent({
          eventType: 'lawyer_selected',
          actorId: requester.userId,
          caseId: p.caseId,
          payload: {
            caseId: p.caseId,
            citizenId: requester.userId,
            lawyerId: p.lawyerId,
            proposalId: p.id,
          },
        });
        void publishEvent('proposal-events', selectedEvent).catch((err) => {
          console.error('Kafka publish failed (lawyer_selected):', err);
        });

        return { proposal: accepted, updatedCase };
      } else {
        const [rejected] = await tx
          .update(caseProposals)
          .set({ status: 'rejected' as any, updatedAt: new Date() as any })
          .where(eq(caseProposals.id, proposalId))
          .returning();
        return { proposal: rejected };
      }
    });

    if (status === 'accepted' && result?.updatedCase && result.proposal) {
      void notifyLawyerSelected({
        lawyerId: result.proposal.lawyerId,
        citizenId: requester.userId,
        caseId: result.proposal.caseId,
        proposalId: result.proposal.id,
      }).catch((err) => console.error('In-app notifyLawyerSelected failed:', err));
    }

    return result;
  }

  async withdraw(proposalId: number, requester: { role: 'lawyer'; userId: string }): Promise<CaseProposal | null> {
    // Only owning lawyer can withdraw
    const [p] = await db.select().from(caseProposals).where(eq(caseProposals.id, proposalId)).limit(1);
    if (!p) return null;
    if (p.lawyerId !== requester.userId) return null;

    const [updated] = await db
      .update(caseProposals)
      .set({ status: 'withdrawn' as any, updatedAt: new Date() as any })
      .where(eq(caseProposals.id, proposalId))
      .returning();
    return updated ?? null;
  }
}

export default new ProposalsService();


