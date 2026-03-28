import { eq } from 'drizzle-orm';
import { db } from '../db';
import { cases, caseMessages, type CaseMessage } from '../models/schema';
import { buildEvent, publishEvent } from './kafka.service';
import { notifyNewMessage } from './notification-dispatch.service';
import { encryptMessageForStorage, decryptMessageFromStorage } from '../utils/message-crypto';

function mapMessageForClient(row: CaseMessage): CaseMessage {
  return {
    ...row,
    message: decryptMessageFromStorage(row.message),
  };
}

async function ensureParticipant(caseId: number, userId: string): Promise<boolean> {
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);

  if (!c) {
    return false;
  }

  if (!userId || userId.trim() === '') {
    return true;
  }

  if (c.citizenId === userId || c.lawyerId === userId) {
    return true;
  }

  return false;
}

class MessagesService {
  async createMessage(caseId: number, senderId: string, recipientId: string, message: string): Promise<CaseMessage | null> {
    const isSenderParticipant = await ensureParticipant(caseId, senderId);
    if (!isSenderParticipant) return null;

    const [caseData] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    if (!caseData) return null;

    let effectiveRecipientId = recipientId;
    if (!effectiveRecipientId || effectiveRecipientId.trim() === '') {
      if (senderId === caseData.citizenId) {
        if (!caseData.lawyerId) {
          return null;
        }
        effectiveRecipientId = caseData.lawyerId;
      } else if (senderId === caseData.lawyerId) {
        effectiveRecipientId = caseData.citizenId;
      } else {
        return null;
      }
    }

    const isRecipientParticipant = await ensureParticipant(caseId, effectiveRecipientId);
    if (!isRecipientParticipant) return null;

    const storedPayload = encryptMessageForStorage(message);

    try {
      const [newMessage] = await db
        .insert(caseMessages)
        .values({
          caseId,
          senderId,
          recipientId: effectiveRecipientId,
          message: storedPayload,
          isRead: false,
        })
        .returning();

      if (newMessage) {
        const event = buildEvent({
          eventType: 'case-message-created',
          actorId: senderId,
          caseId,
          payload: {
            messageId: newMessage.id,
            senderId,
            receiverId: effectiveRecipientId,
          },
        });

        void publishEvent('message-events', event).catch((err) => {
          console.error('Kafka publish failed (case-message-created):', err);
        });

        void notifyNewMessage({
          receiverId: effectiveRecipientId,
          caseId,
          senderId,
          messageId: newMessage.id,
        }).catch((err) => console.error('In-app notifyNewMessage failed:', err));
      }

      return newMessage ? mapMessageForClient(newMessage) : null;
    } catch (error) {
      console.error('Create message error:', error);
      return null;
    }
  }

  async listMessages(caseId: number, requesterId: string): Promise<CaseMessage[] | null> {
    const isParticipant = await ensureParticipant(caseId, requesterId);
    if (!isParticipant) return null;
    const rows = await db.select().from(caseMessages).where(eq(caseMessages.caseId, caseId));
    return rows.map(mapMessageForClient);
  }

  async markRead(messageId: number, requesterId: string): Promise<CaseMessage | null> {
    const [msg] = await db.select().from(caseMessages).where(eq(caseMessages.id, messageId)).limit(1);
    if (!msg) return null;
    const isParticipant = await ensureParticipant(msg.caseId as number, requesterId);
    if (!isParticipant) return null;
    const [updated] = await db
      .update(caseMessages)
      .set({ isRead: true })
      .where(eq(caseMessages.id, messageId))
      .returning();
    return updated ? mapMessageForClient(updated) : null;
  }
}

export default new MessagesService();
