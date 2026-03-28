import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { cases, lawyerProfiles, notifications, users } from '../models/schema';
import notificationService from './notification.service';
import { getIO } from './socket.service';
import type { Notification } from '../models/schema';

function emitToUser(userId: string, notification: Notification): void {
  try {
    const io = getIO();
    console.log('Emitting notification to user:', userId, notification.id);
    io.to(`user:${userId}`).emit('notification:new', notification);
  } catch (err) {
    console.warn('Socket emit notification skipped (IO not ready):', err);
  }
}

async function existsDedupe(userId: string, dedupeKey: string): Promise<boolean> {
  const [row] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), sql`(notifications.meta->>'dedupeKey') = ${dedupeKey}`))
    .limit(1);
  return !!row;
}

async function insertAndEmit(
  userId: string,
  input: {
    caseId?: number | null;
    type: string;
    title: string;
    body: string;
    meta?: Record<string, unknown>;
    dedupeKey: string;
  }
): Promise<void> {
  if (await existsDedupe(userId, input.dedupeKey)) {
    return;
  }
  const meta = { ...(input.meta ?? {}), dedupeKey: input.dedupeKey };
  const n = await notificationService.createNotification({
    userId,
    caseId: input.caseId ?? null,
    type: input.type,
    title: input.title,
    body: input.body,
    meta,
  });
  emitToUser(userId, n);
}

export async function notifyNewMessage(params: {
  receiverId: string;
  caseId: number;
  senderId: string;
  messageId: number;
  content: string;
}): Promise<void> {
  const dedupeKey = `message:${params.messageId}`;
  const [sender] = await db.select({ name: users.name }).from(users).where(eq(users.id, params.senderId)).limit(1);
  const fromName = sender?.name ? String(sender.name) : 'Someone';
  await insertAndEmit(params.receiverId, {
    caseId: params.caseId,
    type: 'message',
    title: `New message from ${fromName}`,
    body: params.content,
    dedupeKey,
    meta: {
      messageId: params.messageId,
      caseId: params.caseId,
      senderId: params.senderId,
    },
  });
}

export async function notifyLawyerApplied(params: {
  citizenId: string;
  lawyerId: string;
  caseId: number;
  proposalId: number;
}): Promise<void> {
  const dedupeKey = `lawyer_applied:${params.proposalId}`;
  const [lawyer] = await db.select({ name: users.name }).from(users).where(eq(users.id, params.lawyerId)).limit(1);
  const lawyerName = lawyer?.name ? String(lawyer.name) : 'A lawyer';
  await insertAndEmit(params.citizenId, {
    caseId: params.caseId,
    type: 'case',
    title: 'Lawyer applied to your case',
    body: `${lawyerName} has applied to your case.`,
    dedupeKey,
    meta: { lawyerId: params.lawyerId, proposalId: params.proposalId, caseId: params.caseId },
  });
}

export async function notifyLawyerSelected(params: {
  lawyerId: string;
  citizenId: string;
  caseId: number;
  proposalId: number;
}): Promise<void> {
  const dedupeKey = `lawyer_selected:${params.proposalId}`;
  const [citizen] = await db.select({ name: users.name }).from(users).where(eq(users.id, params.citizenId)).limit(1);
  const citizenName = citizen?.name ? String(citizen.name) : 'A citizen';
  await insertAndEmit(params.lawyerId, {
    caseId: params.caseId,
    type: 'case',
    title: 'You were selected for a case',
    body: `${citizenName} selected you for Case #${params.caseId}.`,
    dedupeKey,
    meta: { caseId: params.caseId, citizenId: params.citizenId, proposalId: params.proposalId },
  });
}

export async function notifyDocumentUploaded(params: {
  caseId: number;
  citizenId: string;
  lawyerId: string | null;
  uploadedBy: string;
  documentId: number;
  fileName: string;
}): Promise<void> {
  const dedupeKey = `document:${params.documentId}`;
  const targetUserId =
    params.uploadedBy === params.citizenId ? params.lawyerId : params.citizenId;
  if (!targetUserId) return;

  const [uploader] = await db.select({ name: users.name }).from(users).where(eq(users.id, params.uploadedBy)).limit(1);
  const uploaderName = uploader?.name ? String(uploader.name) : 'Someone';
  await insertAndEmit(targetUserId, {
    caseId: params.caseId,
    type: 'document',
    title: 'New document uploaded',
    body: `${uploaderName} uploaded "${params.fileName}" to Case #${params.caseId}.`,
    dedupeKey,
    meta: {
      caseId: params.caseId,
      documentId: params.documentId,
      fileName: params.fileName,
      uploadedBy: params.uploadedBy,
    },
  });
}

export async function notifyCaseClosed(params: { caseId: number; updatedBy: string }): Promise<void> {
  const [c] = await db.select().from(cases).where(eq(cases.id, params.caseId)).limit(1);
  if (!c) return;

  const targets = [c.citizenId, c.lawyerId].filter(Boolean) as string[];
  for (const userId of targets) {
    const dedupeKey = `case_closed:${params.caseId}:${userId}`;
    await insertAndEmit(userId, {
      caseId: params.caseId,
      type: 'case',
      title: 'Case closed',
      body: `Case #${params.caseId} has been closed.`,
      dedupeKey,
      meta: { caseId: params.caseId, updatedBy: params.updatedBy },
    });
  }
}

export async function notifyPreferredLawyerNewRequest(params: {
  preferredLawyerId: string;
  caseId: number;
  citizenId: string;
}): Promise<void> {
  const dedupeKey = `case_direct_request:${params.caseId}`;
  const [citizen] = await db.select({ name: users.name }).from(users).where(eq(users.id, params.citizenId)).limit(1);
  const citizenName = citizen?.name ? String(citizen.name) : 'A citizen';
  await insertAndEmit(params.preferredLawyerId, {
    caseId: params.caseId,
    type: 'case',
    title: 'New direct case request',
    body: `${citizenName} requested you for Case #${params.caseId}.`,
    dedupeKey,
    meta: { caseId: params.caseId, citizenId: params.citizenId },
  });
}

export async function notifyCaseParticipantUpdate(params: {
  caseId: number;
  updatedByRole: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
}): Promise<void> {
  const [c] = await db.select().from(cases).where(eq(cases.id, params.caseId)).limit(1);
  if (!c) return;

  let targetUserId: string | null = null;
  if (params.updatedByRole === 'lawyer' || params.updatedByRole === 'admin') {
    targetUserId = c.citizenId;
  }
  if (params.updatedByRole === 'citizen') targetUserId = c.lawyerId ?? null;
  if (!targetUserId) return;

  const dedupeKey = `case_update:${params.caseId}:${params.newStatus}:${params.updatedBy}`;
  const prev = params.previousStatus;
  const next = params.newStatus;
  const statusText =
    prev && next && prev !== next ? `Status changed: ${prev} → ${next}.` : 'Case updated.';
  await insertAndEmit(targetUserId, {
    caseId: params.caseId,
    type: 'case',
    title: 'Case update',
    body: `Case #${params.caseId}: ${statusText}`,
    dedupeKey,
    meta: { caseId: params.caseId, previousStatus: prev, newStatus: next, updatedBy: params.updatedBy },
  });
}

export async function notifyMatchingLawyersNewOpenCase(params: {
  caseId: number;
  category: string;
  location: string | null;
}): Promise<void> {
  const category = String(params.category || '').trim();
  if (!category) return;

  const matching = await db
    .select({ userId: lawyerProfiles.userId })
    .from(lawyerProfiles)
    .where(sql`${lawyerProfiles.specializations} @> ARRAY[${category}]::text[]`);

  const location = params.location ? String(params.location) : null;

  for (const row of matching) {
    const dedupeKey = `new_case_category:${params.caseId}:${row.userId}`;
    await insertAndEmit(row.userId, {
      caseId: params.caseId,
      type: 'case',
      title: 'New case posted',
      body: location
        ? `New ${category} case posted in ${location}.`
        : `New ${category} case posted.`,
      dedupeKey,
      meta: { caseId: params.caseId, category, location },
    });
  }
}

/** Used by Kafka consumer: same handlers, dedupe prevents duplicates when both paths run. */
export const notificationDispatch = {
  notifyNewMessage,
  notifyLawyerApplied,
  notifyLawyerSelected,
  notifyDocumentUploaded,
  notifyCaseClosed,
  notifyPreferredLawyerNewRequest,
  notifyCaseParticipantUpdate,
  notifyMatchingLawyersNewOpenCase,
};
