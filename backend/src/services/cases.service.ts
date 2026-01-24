import { and, eq, isNull, sql, or } from 'drizzle-orm';
import { db } from '../db';
import { cases, type Case, type NewCase } from '../models/schema';

export type CaseStatus = 'pending' | 'pending_lawyer_acceptance' | 'in_progress' | 'resolved' | 'closed' | 'rejected';

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
  open?: boolean; // lawyer only: show open cases (unassigned, pending)
  limit?: number;
  offset?: number;
  status?: CaseStatus;
  category?: string;
  citizenId?: string;
  lawyerId?: string;
}

export interface UpdateCaseInput {
  // citizen while pending: can edit basic fields
  title?: string;
  description?: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredLanguage?: string;
  location?: string;
  budget?: number;
  // lawyer/admin can update process fields
  status?: CaseStatus;
  nextHearingDate?: Date | null;
  resolution?: string | null;
}

class CasesService {
  async createCase(input: CreateCaseInput): Promise<Case> {
    // Check if there's already a pending direct contact request to the same lawyer
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
    return created;
  }

  async listCases(params: ListCasesParams): Promise<Case[]> {
    const { role, userId, open, limit = 50, offset = 0, status, category, citizenId, lawyerId } = params;

    const where: any[] = [];

    if (role === 'citizen') {
      where.push(eq(cases.citizenId, userId));
    } else if (role === 'lawyer') {
      if (open) {
        // show open cases (no lawyer assigned, pending)
        where.push(and(isNull(cases.lawyerId), eq(cases.status, 'pending')));
      } else {
        // assigned to this lawyer OR direct contact requests
        where.push(
          or(
            eq(cases.lawyerId, userId),
            eq(cases.preferredLawyerId, userId)
          )!
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

    const list = await db
      .select()
      .from(cases)
      .where(where.length > 0 ? and(...where) : undefined)
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

  async updateCase(id: number, requester: { role: 'citizen' | 'lawyer' | 'admin'; userId: string }, update: UpdateCaseInput): Promise<Case | null> {
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
      return updated;
    }

    if (requester.role === 'lawyer' || requester.role === 'admin') {
      // Lawyers can only update cases they're assigned to
      if (requester.role === 'lawyer' && existing.lawyerId !== requester.userId) {
        return null;
      }
      
      const [updated] = await db
        .update(cases)
        .set({
          status: (update.status ?? existing.status) as any,
          nextHearingDate: update.nextHearingDate === undefined ? existing.nextHearingDate : (update.nextHearingDate as any),
          resolution: update.resolution === undefined ? existing.resolution : update.resolution,
          updatedAt: new Date() as any,
        })
        .where(eq(cases.id, id))
        .returning();
      return updated;
    }

    return null;
  }

  async assignCase(id: number, lawyerId: string, requester: { role: 'lawyer' | 'admin'; userId: string }): Promise<Case | null> {
    const [existing] = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (!existing) return null;

    if (requester.role === 'lawyer' && requester.userId !== lawyerId) {
      // lawyer can only assign to self
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

  async stats(): Promise<{ total: number; pending: number; in_progress: number; resolved: number }> {
    const [row] = await db.execute(sql`SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
      COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
      FROM cases`);
    return {
      total: Number((row as any).total ?? 0),
      pending: Number((row as any).pending ?? 0),
      in_progress: Number((row as any).in_progress ?? 0),
      resolved: Number((row as any).resolved ?? 0),
    };
  }
}

export default new CasesService();


