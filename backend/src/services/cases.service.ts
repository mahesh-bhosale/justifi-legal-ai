import { and, desc, eq, getTableColumns, ilike, isNull, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../db';
import {
  cases,
  caseProposals,
  caseUpdates,
  users,
  type Case,
  type NewCase,
} from '../models/schema';
import { buildEvent, publishEvent } from './kafka.service';
import {
  notifyCaseClosed,
  notifyCaseParticipantUpdate,
  notifyCaseResolved,
  notifyCaseTerminated,
  notifyCaseWithdrawn,
  notifyMatchingLawyersNewOpenCase,
  notifyPreferredLawyerNewRequest,
} from './notification-dispatch.service';

export type CaseStatus = 'pending' | 'pending_lawyer_acceptance' | 'in_progress' | 'resolved' | 'closed' | 'rejected';

export type CaseWithNames = Case & { citizenName?: string; lawyerName?: string | null };

export type CaseLifecycleErrorCode =
  | 'not_found'
  | 'forbidden'
  | 'invalid_status'
  | 'missing_resolution'
  | 'invalid_transition'
  | 'not_withdrawable'
  | 'lawyer_assigned'
  | 'proposal_accepted';

export type CaseLifecycleResult<T> = { ok: true; data: T } | { ok: false; error: CaseLifecycleErrorCode };

const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  pending: ['in_progress', 'closed'],
  pending_lawyer_acceptance: ['in_progress', 'rejected', 'closed'],
  in_progress: ['resolved', 'closed'],
  resolved: [],
  closed: [],
  rejected: [],
};

function canTransition(from: CaseStatus, to: CaseStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

async function insertCaseAudit(
  caseId: number,
  updatedBy: string,
  updateType: string,
  description: string
): Promise<void> {
  await db.insert(caseUpdates).values({
    caseId,
    updatedBy,
    updateType,
    description,
  });
}

export interface CreateCaseInput {
  citizenId: string;
  title: string;
  description: string;
  category: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  preferredLawyerId?: string;
}

export interface ListCasesParams {
  role: 'citizen' | 'lawyer' | 'admin';
  userId: string;
  open?: boolean;
  limit?: number;
  offset?: number;
  status?: CaseStatus;
  category?: string;
  citizenId?: string;
  lawyerId?: string;
  search?: string;
}

export interface UpdateCaseInput {
  title?: string;
  description?: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  status?: CaseStatus;
  nextHearingDate?: Date | null;
  resolution?: string | null;
}

export interface CaseAuditRow {
  id: number;
  caseId: number;
  updatedBy: string;
  updatedByName: string | null;
  updateType: string;
  description: string;
  createdAt: Date;
}

function appendListFilters(where: any[], params: ListCasesParams): void {
  const { role, userId, open, status, category, citizenId, lawyerId, search } = params;

  if (role === 'citizen') {
    where.push(eq(cases.citizenId, userId));
  } else if (role === 'lawyer') {
    if (open) {
      where.push(and(isNull(cases.lawyerId), eq(cases.status, 'pending')));
    } else {
      where.push(
        or(eq(cases.lawyerId, userId), eq(cases.preferredLawyerId, userId))!
      );
    }
  } else if (role === 'admin') {
    if (citizenId) where.push(eq(cases.citizenId, citizenId));
    if (lawyerId) where.push(eq(cases.lawyerId, lawyerId));
    if (status) where.push(eq(cases.status, status));
    if (category) where.push(eq(cases.category, category));
  }

  if (status && role !== 'admin') {
    where.push(eq(cases.status, status));
  }
  if (category && role !== 'admin') {
    where.push(eq(cases.category, category));
  }

  if (role === 'admin' && search?.trim()) {
    const q = `%${search.trim()}%`;
    where.push(or(ilike(cases.title, q), ilike(cases.category, q))!);
  }
}

class CasesService {
  async createCase(input: CreateCaseInput): Promise<Case> {
    if (input.preferredLawyerId) {
      const existingRequest = await db
        .select()
        .from(cases)
        .where(
          and(
            eq(cases.citizenId, input.citizenId),
            eq(cases.preferredLawyerId, input.preferredLawyerId),
            eq(cases.status, 'pending_lawyer_acceptance' as any)
          )
        )
        .limit(1);

      if (existingRequest.length > 0) {
        throw new Error('You already have a pending contact request to this lawyer');
      }
    }

    const payload: NewCase = {
      citizenId: input.citizenId,
      title: input.title,
      description: input.description,
      category: input.category,
      urgency: (input.urgency ?? 'medium') as any,
      preferredLanguage: input.preferredLanguage,
      location: input.location,
      budget: input.budget === undefined ? undefined : (input.budget as any),
      preferredLawyerId: input.preferredLawyerId,
      status: input.preferredLawyerId ? ('pending_lawyer_acceptance' as any) : ('pending' as any),
    };
    const [created] = await db.insert(cases).values(payload).returning();

    const createdEvent = buildEvent({
      eventType: 'case_created',
      actorId: input.citizenId,
      caseId: created.id,
      payload: {
        caseId: created.id,
        citizenId: created.citizenId,
        preferredLawyerId: created.preferredLawyerId,
        category: created.category,
        location: created.location,
        title: created.title,
        status: created.status,
      },
    });
    void publishEvent('case-events', createdEvent).catch((err) => {
      console.error('Kafka publish failed (case_created):', err);
    });

    if (!created.preferredLawyerId) {
      const postedEvent = buildEvent({
        eventType: 'new_case_posted',
        actorId: input.citizenId,
        caseId: created.id,
        payload: {
          caseId: created.id,
          citizenId: created.citizenId,
          category: created.category,
          location: created.location,
          title: created.title,
          urgency: created.urgency,
        },
      });
      void publishEvent('case-events', postedEvent).catch((err) => {
        console.error('Kafka publish failed (new_case_posted):', err);
      });

      void notifyMatchingLawyersNewOpenCase({
        caseId: created.id,
        category: String(created.category ?? ''),
        location: created.location ? String(created.location) : null,
      }).catch((err) => console.error('In-app notifyMatchingLawyersNewOpenCase failed:', err));
    }

    if (created.preferredLawyerId) {
      void notifyPreferredLawyerNewRequest({
        preferredLawyerId: created.preferredLawyerId,
        caseId: created.id,
        citizenId: created.citizenId,
      }).catch((err) => console.error('In-app notifyPreferredLawyerNewRequest failed:', err));
    }

    return created;
  }

  async listCases(params: ListCasesParams): Promise<CaseWithNames[]> {
    const { role, limit = 50, offset = 0 } = params;
    const where: any[] = [];
    appendListFilters(where, params);
    const whereExpr = where.length > 0 ? and(...where) : undefined;

    if (role === 'admin') {
      const citizenUser = alias(users, 'case_citizen');
      const lawyerUser = alias(users, 'case_lawyer');
      const rows = await db
        .select({
          ...getTableColumns(cases),
          citizenName: citizenUser.name,
          lawyerName: lawyerUser.name,
        })
        .from(cases)
        .leftJoin(citizenUser, eq(cases.citizenId, citizenUser.id))
        .leftJoin(lawyerUser, eq(cases.lawyerId, lawyerUser.id))
        .where(whereExpr)
        .orderBy(desc(cases.createdAt))
        .limit(limit)
        .offset(offset);
      return rows as CaseWithNames[];
    }

    const list = await db
      .select()
      .from(cases)
      .where(whereExpr)
      .orderBy(desc(cases.createdAt))
      .limit(limit)
      .offset(offset);

    return list;
  }

  async getById(id: number, requester: { role: 'citizen' | 'lawyer' | 'admin'; userId: string }): Promise<Case | null> {
    const [found] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!found) return null;

    if (requester.role === 'admin') return found;
    if (requester.role === 'citizen' && found.citizenId === requester.userId) return found;
    if (requester.role === 'lawyer' && (
      found.lawyerId === requester.userId ||
      found.preferredLawyerId === requester.userId ||
      (found.status === 'pending' && !found.lawyerId)
    )) return found;
    return null;
  }

  async listCaseAuditLog(
    caseId: number,
    requester: { role: 'citizen' | 'lawyer' | 'admin'; userId: string }
  ): Promise<CaseAuditRow[] | null> {
    if (requester.role !== 'admin') return null;
    const c = await this.getById(caseId, requester);
    if (!c) return null;

    const auditor = alias(users, 'audit_user');
    const rows = await db
      .select({
        id: caseUpdates.id,
        caseId: caseUpdates.caseId,
        updatedBy: caseUpdates.updatedBy,
        updatedByName: auditor.name,
        updateType: caseUpdates.updateType,
        description: caseUpdates.description,
        createdAt: caseUpdates.createdAt,
      })
      .from(caseUpdates)
      .leftJoin(auditor, eq(caseUpdates.updatedBy, auditor.id))
      .where(eq(caseUpdates.caseId, caseId))
      .orderBy(desc(caseUpdates.createdAt));

    return rows;
  }

  async updateCase(
    id: number,
    requester: { role: 'citizen' | 'lawyer' | 'admin'; userId: string },
    update: UpdateCaseInput
  ): Promise<Case | null> {
    const [existing] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!existing) return null;

    if (requester.role === 'citizen') {
      if (existing.citizenId !== requester.userId) return null;
      if (existing.status !== 'pending' && existing.status !== 'pending_lawyer_acceptance') return null;
      const allowed: Partial<NewCase> = {
        title: update.title ?? existing.title,
        description: update.description ?? existing.description,
        category: update.category ?? existing.category,
        urgency: (update.urgency ?? existing.urgency) as any,
        preferredLanguage: update.preferredLanguage ?? existing.preferredLanguage,
        location: update.location ?? existing.location,
        budget: (update.budget ?? (existing.budget as any)) as any,
        updatedAt: new Date() as any,
      } as any;
      const [updated] = await db.update(cases).set(allowed).where(eq(cases.id, id)).returning();

      const evt = buildEvent({
        eventType: 'case_updated',
        actorId: requester.userId,
        caseId: id,
        payload: {
          caseId: id,
          updatedByRole: requester.role,
          previousStatus: existing.status,
          newStatus: updated.status,
        },
      });
      void publishEvent('case-events', evt).catch((err) => {
        console.error('Kafka publish failed (case_updated):', err);
      });

      return updated;
    }

    if (requester.role === 'lawyer' || requester.role === 'admin') {
      if (requester.role === 'lawyer' && existing.lawyerId !== requester.userId) {
        return null;
      }

      if (
        requester.role === 'lawyer' &&
        update.status !== undefined &&
        (update.status === 'resolved' || update.status === 'closed')
      ) {
        return null;
      }

      const prevStatus = existing.status as CaseStatus;
      const nextStatus = (update.status !== undefined ? update.status : prevStatus) as CaseStatus;

      if (update.status !== undefined && update.status !== prevStatus) {
        if (!canTransition(prevStatus, nextStatus)) {
          return null;
        }
      }

      const [updated] = await db
        .update(cases)
        .set({
          status: nextStatus as any,
          nextHearingDate: update.nextHearingDate === undefined ? existing.nextHearingDate : (update.nextHearingDate as any),
          resolution: update.resolution === undefined ? existing.resolution : update.resolution,
          updatedAt: new Date() as any,
        })
        .where(eq(cases.id, id))
        .returning();

      const statusChanged = update.status !== undefined && update.status !== (existing.status as any);

      if (statusChanged && requester.role === 'admin') {
        await insertCaseAudit(
          id,
          requester.userId,
          'STATUS_OVERRIDE',
          `Status changed from ${existing.status} to ${update.status} by admin`
        );
      }

      const evt = buildEvent({
        eventType: statusChanged && update.status === 'closed' ? 'case_closed' : 'case_updated',
        actorId: requester.userId,
        caseId: id,
        payload: {
          caseId: id,
          updatedByRole: requester.role,
          previousStatus: existing.status,
          newStatus: updated.status,
          nextHearingDate: updated.nextHearingDate,
        },
      });
      void publishEvent('case-events', evt).catch((err) => {
        console.error('Kafka publish failed (case_update/case_closed):', err);
      });

      if (updated) {
        if (update.status === 'closed') {
          void notifyCaseClosed({ caseId: id, updatedBy: requester.userId }).catch((err) =>
            console.error('In-app notifyCaseClosed failed:', err)
          );
        } else if (
          existing.citizenId &&
          (statusChanged ||
            update.nextHearingDate !== undefined ||
            update.resolution !== undefined)
        ) {
          void notifyCaseParticipantUpdate({
            caseId: id,
            updatedByRole: requester.role,
            previousStatus: String(existing.status),
            newStatus: String(updated.status),
            updatedBy: requester.userId,
          }).catch((err) => console.error('In-app notifyCaseParticipantUpdate failed:', err));
        }
      }

      return updated;
    }

    return null;
  }

  /**
   * Lawyer or admin marks case finished with a resolution note.
   * TODO: Phase 2 — citizen resolution confirmation (e.g. pending_resolution_confirmation) before truly final.
   */
  async resolveCase(
    id: number,
    requester: { role: 'lawyer' | 'admin'; userId: string },
    resolution: string
  ): Promise<CaseLifecycleResult<Case>> {
    const trimmed = resolution?.trim() ?? '';
    if (!trimmed) {
      return { ok: false, error: 'missing_resolution' };
    }

    const [existing] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!existing) return { ok: false, error: 'not_found' };

    if (existing.status !== 'in_progress') {
      return { ok: false, error: 'invalid_status' };
    }

    if (requester.role === 'lawyer') {
      if (existing.lawyerId !== requester.userId) {
        return { ok: false, error: 'forbidden' };
      }
    }

    if (!canTransition(existing.status as CaseStatus, 'resolved')) {
      return { ok: false, error: 'invalid_transition' };
    }

    const [updated] = await db
      .update(cases)
      .set({
        status: 'resolved' as any,
        resolution: trimmed,
        updatedAt: new Date() as any,
      })
      .where(eq(cases.id, id))
      .returning();

    const actor = requester.role === 'lawyer' ? existing.lawyerId! : requester.userId;
    const resolvedBy = requester.role === 'lawyer' ? 'lawyer' : 'admin';
    await insertCaseAudit(
      id,
      actor,
      'CASE_RESOLVED',
      `Case resolved by ${resolvedBy}. Resolution: ${trimmed}`
    );

    void notifyCaseResolved({
      caseId: id,
      citizenId: existing.citizenId,
      lawyerId: existing.lawyerId,
    }).catch((err) => console.error('notifyCaseResolved failed:', err));

    const evt = buildEvent({
      eventType: 'case_updated',
      actorId: requester.userId,
      caseId: id,
      payload: { caseId: id, previousStatus: existing.status, newStatus: 'resolved' },
    });
    void publishEvent('case-events', evt).catch((err) => console.error('Kafka publish failed (resolve):', err));

    return { ok: true, data: updated };
  }

  async terminateCase(
    id: number,
    requester: { role: 'lawyer' | 'admin'; userId: string }
  ): Promise<CaseLifecycleResult<Case>> {
    const [existing] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!existing) return { ok: false, error: 'not_found' };

    if (existing.status !== 'in_progress') {
      return { ok: false, error: 'invalid_status' };
    }

    if (requester.role === 'lawyer') {
      if (existing.lawyerId !== requester.userId) {
        return { ok: false, error: 'forbidden' };
      }
    }

    if (!canTransition(existing.status as CaseStatus, 'closed')) {
      return { ok: false, error: 'invalid_transition' };
    }

    const [updated] = await db
      .update(cases)
      .set({
        status: 'closed' as any,
        updatedAt: new Date() as any,
      })
      .where(eq(cases.id, id))
      .returning();

    const terminatedBy = requester.role === 'lawyer' ? 'lawyer' : 'admin';
    await insertCaseAudit(id, requester.userId, 'CASE_TERMINATED', `Case terminated by ${terminatedBy}`);

    if (existing.lawyerId) {
      void notifyCaseTerminated({
        caseId: id,
        citizenId: existing.citizenId,
        lawyerId: existing.lawyerId,
      }).catch((err) => console.error('notifyCaseTerminated failed:', err));
    }

    void notifyCaseClosed({ caseId: id, updatedBy: requester.userId }).catch((err) =>
      console.error('notifyCaseClosed failed:', err)
    );

    const evt = buildEvent({
      eventType: 'case_closed',
      actorId: requester.userId,
      caseId: id,
      payload: { caseId: id, previousStatus: existing.status, newStatus: 'closed', reason: 'terminated' },
    });
    void publishEvent('case-events', evt).catch((err) => console.error('Kafka publish failed (terminate):', err));

    return { ok: true, data: updated };
  }

  async withdrawCase(
    id: number,
    citizenId: string,
    reason: string,
    note?: string
  ): Promise<CaseLifecycleResult<Case>> {
    const [existing] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!existing) return { ok: false, error: 'not_found' };

    if (existing.citizenId !== citizenId) {
      return { ok: false, error: 'forbidden' };
    }

    const st = existing.status as string;
    if (st !== 'pending' && st !== 'pending_lawyer_acceptance') {
      return { ok: false, error: 'not_withdrawable' };
    }

    if (existing.lawyerId != null) {
      return { ok: false, error: 'lawyer_assigned' };
    }

    const accepted = await db
      .select({ id: caseProposals.id })
      .from(caseProposals)
      .where(and(eq(caseProposals.caseId, id), eq(caseProposals.status, 'accepted' as any)))
      .limit(1);
    if (accepted.length > 0) {
      return { ok: false, error: 'proposal_accepted' };
    }

    if (!canTransition(existing.status as CaseStatus, 'closed')) {
      return { ok: false, error: 'invalid_transition' };
    }

    const reasonLine = note?.trim()
      ? `WITHDRAWAL_REASON: ${reason} — ${note.trim()}`
      : `WITHDRAWAL_REASON: ${reason}`;

    const [updated] = await db
      .update(cases)
      .set({
        status: 'closed' as any,
        resolution: reasonLine,
        updatedAt: new Date() as any,
      })
      .where(eq(cases.id, id))
      .returning();

    const descText = note?.trim()
      ? `Case withdrawn by citizen. Reason: ${reason} — ${note.trim()}`
      : `Case withdrawn by citizen. Reason: ${reason}`;

    await insertCaseAudit(id, citizenId, 'CASE_WITHDRAWN', descText);

    void notifyCaseWithdrawn({ caseId: id, citizenId }).catch((err) =>
      console.error('notifyCaseWithdrawn failed:', err)
    );

    const evt = buildEvent({
      eventType: 'case_closed',
      actorId: citizenId,
      caseId: id,
      payload: { caseId: id, previousStatus: existing.status, newStatus: 'closed', reason: 'withdrawn' },
    });
    void publishEvent('case-events', evt).catch((err) => console.error('Kafka publish failed (withdraw):', err));

    return { ok: true, data: updated };
  }

  async deleteCase(id: number, adminId: string): Promise<boolean> {
    const [existing] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!existing) return false;

    // case_updates CASCADE-deletes with the case; Kafka keeps an external audit trail.
    await insertCaseAudit(id, adminId, 'CASE_DELETED', 'Case permanently deleted by admin');
    const delEvt = buildEvent({
      eventType: 'case_deleted_by_admin',
      actorId: adminId,
      caseId: id,
      payload: { caseId: id, description: 'Case permanently deleted by admin' },
    });
    void publishEvent('case-events', delEvt).catch((err) => console.error('Kafka publish failed (case_deleted):', err));
    await db.delete(cases).where(eq(cases.id, id));
    return true;
  }

  async assignCase(id: number, lawyerId: string, requester: { role: 'lawyer' | 'admin'; userId: string }): Promise<Case | null> {
    const [existing] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!existing) return null;

    if (requester.role === 'lawyer' && requester.userId !== lawyerId) {
      return null;
    }

    const nextStatus: CaseStatus = existing.status === 'pending' ? 'in_progress' : existing.status as CaseStatus;

    const [updated] = await db
      .update(cases)
      .set({ lawyerId, status: nextStatus as any, updatedAt: new Date() as any })
      .where(eq(cases.id, id))
      .returning();
    return updated;
  }

  async getDirectContactRequests(lawyerId: string): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(
        and(
          eq(cases.preferredLawyerId, lawyerId),
          eq(cases.status, 'pending_lawyer_acceptance' as any)
        )
      )
      .orderBy(cases.createdAt);
  }

  async acceptDirectContact(caseId: number, lawyerId: string): Promise<Case | null> {
    const [existing] = await db
      .select()
      .from(cases)
      .where(
        and(
          eq(cases.id, caseId),
          eq(cases.preferredLawyerId, lawyerId),
          eq(cases.status, 'pending_lawyer_acceptance' as any)
        )
      )
      .limit(1);

    if (!existing) return null;

    const [updated] = await db
      .update(cases)
      .set({
        lawyerId: lawyerId,
        status: 'in_progress' as any,
        updatedAt: new Date() as any,
      })
      .where(eq(cases.id, caseId))
      .returning();

    return updated;
  }

  async rejectDirectContact(caseId: number, lawyerId: string): Promise<Case | null> {
    const [existing] = await db
      .select()
      .from(cases)
      .where(
        and(
          eq(cases.id, caseId),
          eq(cases.preferredLawyerId, lawyerId),
          eq(cases.status, 'pending_lawyer_acceptance' as any)
        )
      )
      .limit(1);

    if (!existing) return null;

    const [updated] = await db
      .update(cases)
      .set({
        status: 'rejected' as any,
        updatedAt: new Date() as any,
      })
      .where(eq(cases.id, caseId))
      .returning();

    return updated;
  }

  async stats(): Promise<{
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    closed: number;
    rejected: number;
  }> {
    const [row] = await db.execute(sql`SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
      COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
      COUNT(*) FILTER (WHERE status = 'closed')::int AS closed,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
      FROM cases`);
    return {
      total: Number((row as any).total ?? 0),
      pending: Number((row as any).pending ?? 0),
      in_progress: Number((row as any).in_progress ?? 0),
      resolved: Number((row as any).resolved ?? 0),
      closed: Number((row as any).closed ?? 0),
      rejected: Number((row as any).rejected ?? 0),
    };
  }
}

export default new CasesService();

