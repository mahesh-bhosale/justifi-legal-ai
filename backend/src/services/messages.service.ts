import { eq } from 'drizzle-orm';
import { db } from '../db';
import { cases, caseMessages, type CaseMessage } from '../models/schema';

async function ensureParticipant(caseId: number, userId: string): Promise<boolean> {
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
  if (!c) return false;
  if (c.citizenId === userId) return true;
  if (c.lawyerId === userId) return true;
  return false;
}

class MessagesService {
  async createMessage(caseId: number, senderId: string, recipientId: string, message: string): Promise<CaseMessage | null> {
    const isSenderParticipant = await ensureParticipant(caseId, senderId);
    const isRecipientParticipant = await ensureParticipant(caseId, recipientId);
    if (!isSenderParticipant || !isRecipientParticipant) return null;

    const [created] = await db
      .insert(caseMessages)
      .values({ caseId, senderId, recipientId, message })
      .returning();
    return created ?? null;
  }

  async listMessages(caseId: number, requesterId: string): Promise<CaseMessage[] | null> {
    const isParticipant = await ensureParticipant(caseId, requesterId);
    if (!isParticipant) return null;
    const rows = await db.select().from(caseMessages).where(eq(caseMessages.caseId, caseId));
    return rows;
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
    return updated ?? null;
  }
}

export default new MessagesService();


