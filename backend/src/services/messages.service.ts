import { eq } from 'drizzle-orm';
import { db } from '../db';
import { cases, caseMessages, type CaseMessage } from '../models/schema';

async function ensureParticipant(caseId: number, userId: string): Promise<boolean> {
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
  console.log('Participant check:', { caseId, userId, case: c });
  
  if (!c) {
    console.log('Case not found');
    return false;
  }
  
  // If userId is empty, check if it's the recipient being validated
  if (!userId || userId.trim() === '') {
    console.log('Empty userId - allowing for recipient check');
    return true;
  }
  
  // Check if user is the citizen or lawyer in the case
  if (c.citizenId === userId || c.lawyerId === userId) {
    console.log('User is participant - allowed');
    return true;
  }
  
  console.log('User not participant:', { citizenId: c.citizenId, lawyerId: c.lawyerId, userId });
  return false;
}

class MessagesService {
  async createMessage(caseId: number, senderId: string, recipientId: string, message: string): Promise<CaseMessage | null> {
    const isSenderParticipant = await ensureParticipant(caseId, senderId);
    if (!isSenderParticipant) return null;

    // Get case details to determine recipient if not provided
    const [caseData] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    if (!caseData) return null;

    // If recipientId is empty, determine it based on the sender's role
    let effectiveRecipientId = recipientId;
    if (!effectiveRecipientId || effectiveRecipientId.trim() === '') {
      // If sender is the citizen, recipient is the lawyer, and vice versa
      if (senderId === caseData.citizenId) {
        if (!caseData.lawyerId) {
          console.error('No lawyer assigned to this case', { caseId });
          return null;
        }
        effectiveRecipientId = caseData.lawyerId;
      } else if (senderId === caseData.lawyerId) {
        effectiveRecipientId = caseData.citizenId;
      } else {
        console.error('Sender is not a participant in this case', { caseId, senderId });
        return null;
      }
      
      console.log('Derived recipient ID:', effectiveRecipientId);
    }

    // Verify the recipient is a participant in the case
    const isRecipientParticipant = await ensureParticipant(caseId, effectiveRecipientId);
    if (!isRecipientParticipant) return null;

    try {
      const [newMessage] = await db
        .insert(caseMessages)
        .values({
          caseId,
          senderId,
          recipientId: effectiveRecipientId,
          message,
          isRead: false,
        })
        .returning();
      return newMessage;
    } catch (error) {
      console.error('Create message error:', error);
      return null;
    }
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


