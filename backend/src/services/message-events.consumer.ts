import { eq, sql } from 'drizzle-orm';
import { getKafkaConsumer } from './kafka.service';
import notificationService from './notification.service';
import socketService from './socket.service';
import { db } from '../db';
import { cases, lawyerProfiles, users } from '../models/schema';

type AnyEvent = {
  eventId: string;
  eventType: string;
  timestamp: string;
  actorId: string;
  caseId: string;
  payload: any;
};

export async function startMessageEventsConsumer(): Promise<void> {
  const consumer = getKafkaConsumer();
  if (!consumer) return;

  await consumer.subscribe({ topic: 'case-message-created' });
  await consumer.subscribe({ topic: 'lawyer-applied-to-case' });
  await consumer.subscribe({ topic: 'lawyer-selected' });
  await consumer.subscribe({ topic: 'case-created' });
  await consumer.subscribe({ topic: 'case-updated' });
  await consumer.subscribe({ topic: 'case-closed' });
  await consumer.subscribe({ topic: 'document-uploaded' });
  await consumer.subscribe({ topic: 'new-case-posted' });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;

      try {
        const event = JSON.parse(message.value.toString('utf8')) as AnyEvent;

        // 1) New chat message -> notify receiver
        if (topic === 'case-message-created' && event.eventType === 'case-message-created') {
          const receiverId = event.payload.receiverId as string;
          const senderId = event.payload.senderId as string;

          const [sender] = await db.select({ name: users.name }).from(users).where(eq(users.id, senderId)).limit(1);
          const fromName = sender?.name ? String(sender.name) : 'Someone';
          const body = event.payload.content as string;
          const caseIdNum = Number(event.caseId);

          const notification = await notificationService.createNotification({
            userId: receiverId,
            caseId: Number.isFinite(caseIdNum) ? caseIdNum : null,
            type: 'message',
            title: `New message from ${fromName}`,
            body,
            meta: {
              messageId: event.payload.messageId,
              caseId: event.caseId,
              senderId,
            },
          });

          const io = socketService.getIO();
          if (io) io.to(`user:${receiverId}`).emit('notification:new', notification);
          return;
        }

        // 2) Lawyer applied -> notify citizen
        if (topic === 'lawyer-applied-to-case' && event.eventType === 'lawyer_applied_to_case') {
          const citizenId = event.payload.citizenId as string;
          const lawyerId = event.payload.lawyerId as string;
          const [lawyer] = await db.select({ name: users.name }).from(users).where(eq(users.id, lawyerId)).limit(1);
          const lawyerName = lawyer?.name ? String(lawyer.name) : 'A lawyer';

          const notification = await notificationService.createNotification({
            userId: citizenId,
            caseId: Number(event.payload.caseId) || null,
            type: 'case',
            title: 'Lawyer applied to your case',
            body: `${lawyerName} has applied to your case.`,
            meta: { lawyerId, proposalId: event.payload.proposalId, caseId: event.payload.caseId },
          });
          const io = socketService.getIO();
          if (io) io.to(`user:${citizenId}`).emit('notification:new', notification);
          return;
        }

        // 3) Citizen selected lawyer -> notify lawyer
        if (topic === 'lawyer-selected' && event.eventType === 'lawyer_selected') {
          const lawyerId = event.payload.lawyerId as string;
          const [citizen] = await db.select({ name: users.name }).from(users).where(eq(users.id, event.payload.citizenId)).limit(1);
          const citizenName = citizen?.name ? String(citizen.name) : 'A citizen';

          const notification = await notificationService.createNotification({
            userId: lawyerId,
            caseId: Number(event.payload.caseId) || null,
            type: 'case',
            title: 'You were selected for a case',
            body: `${citizenName} selected you for Case #${event.payload.caseId}.`,
            meta: { caseId: event.payload.caseId, citizenId: event.payload.citizenId, proposalId: event.payload.proposalId },
          });
          const io = socketService.getIO();
          if (io) io.to(`user:${lawyerId}`).emit('notification:new', notification);
          return;
        }

        // 4) Case closed -> notify both participants
        if (topic === 'case-closed' && event.eventType === 'case_closed') {
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          const [c] = await db.select().from(cases).where(eq(cases.id, caseIdNum)).limit(1);
          if (!c) return;

          const targets = [c.citizenId, c.lawyerId].filter(Boolean) as string[];
          for (const userId of targets) {
            const notification = await notificationService.createNotification({
              userId,
              caseId: caseIdNum,
              type: 'case',
              title: 'Case closed',
              body: `Case #${caseIdNum} has been closed.`,
              meta: { caseId: caseIdNum, updatedBy: event.actorId },
            });
            const io = socketService.getIO();
            if (io) io.to(`user:${userId}`).emit('notification:new', notification);
          }
          return;
        }

        // 4b) Case created -> notify preferred lawyer (direct contact request)
        if (topic === 'case-created' && event.eventType === 'case_created') {
          const preferredLawyerId = event.payload.preferredLawyerId as string | null | undefined;
          if (preferredLawyerId) {
            const [citizen] = await db
              .select({ name: users.name })
              .from(users)
              .where(eq(users.id, event.payload.citizenId))
              .limit(1);
            const citizenName = citizen?.name ? String(citizen.name) : 'A citizen';
            const notification = await notificationService.createNotification({
              userId: preferredLawyerId,
              caseId: Number(event.payload.caseId) || null,
              type: 'case',
              title: 'New direct case request',
              body: `${citizenName} requested you for Case #${event.payload.caseId}.`,
              meta: { caseId: event.payload.caseId, citizenId: event.payload.citizenId },
            });
            const io = socketService.getIO();
            if (io) io.to(`user:${preferredLawyerId}`).emit('notification:new', notification);
          }
          return;
        }

        // 4c) Case updated -> notify opposite participant for meaningful changes
        if (topic === 'case-updated' && (event.eventType === 'case_updated' || event.eventType === 'case_closed')) {
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          const [c] = await db.select().from(cases).where(eq(cases.id, caseIdNum)).limit(1);
          if (!c) return;

          const updatedByRole = event.payload.updatedByRole as string | undefined;
          let targetUserId: string | null = null;
          if (updatedByRole === 'lawyer') targetUserId = c.citizenId;
          if (updatedByRole === 'citizen') targetUserId = c.lawyerId ?? null;

          if (targetUserId) {
            const prev = event.payload.previousStatus ? String(event.payload.previousStatus) : null;
            const next = event.payload.newStatus ? String(event.payload.newStatus) : null;
            const statusText = prev && next && prev !== next ? `Status changed: ${prev} → ${next}.` : 'Case updated.';
            const notification = await notificationService.createNotification({
              userId: targetUserId,
              caseId: caseIdNum,
              type: 'case',
              title: 'Case update',
              body: `Case #${caseIdNum}: ${statusText}`,
              meta: { caseId: caseIdNum, previousStatus: prev, newStatus: next, updatedBy: event.actorId },
            });
            const io = socketService.getIO();
            if (io) io.to(`user:${targetUserId}`).emit('notification:new', notification);
          }
          return;
        }

        // 4d) Document uploaded -> notify the other participant
        if (topic === 'document-uploaded' && event.eventType === 'document_uploaded') {
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          const citizenId = event.payload.citizenId as string;
          const lawyerId = event.payload.lawyerId as string | null | undefined;
          const uploadedBy = event.payload.uploadedBy as string;

          const targetUserId = uploadedBy === citizenId ? (lawyerId ?? null) : citizenId;
          if (!targetUserId) return;

          const [uploader] = await db.select({ name: users.name }).from(users).where(eq(users.id, uploadedBy)).limit(1);
          const uploaderName = uploader?.name ? String(uploader.name) : 'Someone';

          const notification = await notificationService.createNotification({
            userId: targetUserId,
            caseId: caseIdNum,
            type: 'document',
            title: 'New document uploaded',
            body: `${uploaderName} uploaded “${event.payload.fileName}” to Case #${caseIdNum}.`,
            meta: { caseId: caseIdNum, documentId: event.payload.documentId, fileName: event.payload.fileName, uploadedBy },
          });
          const io = socketService.getIO();
          if (io) io.to(`user:${targetUserId}`).emit('notification:new', notification);
          return;
        }

        // 5) New case posted -> notify matching lawyers by specialization (best-effort)
        if (topic === 'new-case-posted' && event.eventType === 'new_case_posted') {
          const category = String(event.payload.category || '').trim();
          const caseIdNum = Number(event.payload.caseId) || Number(event.caseId);
          const location = event.payload.location ? String(event.payload.location) : null;

          // Best-effort: notify lawyers whose `specializations` array contains the category
          const matching = await db
            .select({ userId: lawyerProfiles.userId })
            .from(lawyerProfiles)
            .where(category ? sql`${lawyerProfiles.specializations} @> ARRAY[${category}]::text[]` : undefined);

          const io = socketService.getIO();
          for (const row of matching) {
            const notification = await notificationService.createNotification({
              userId: row.userId,
              caseId: caseIdNum || null,
              type: 'case',
              title: 'New case posted',
              body: location
                ? `New ${category} case posted in ${location}.`
                : `New ${category} case posted.`,
              meta: { caseId: caseIdNum, category, location },
            });
            if (io) io.to(`user:${row.userId}`).emit('notification:new', notification);
          }
          return;
        }
      } catch (err) {
        console.error('Kafka consumer error:', err);
      }
    },
  });
}

