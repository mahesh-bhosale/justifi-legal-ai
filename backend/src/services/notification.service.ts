import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { notifications, type Notification } from '../models/schema';

type CreateNotificationInput = {
  userId: string;
  caseId?: number | null;
  type: string;
  title: string;
  body: string;
  meta?: Record<string, unknown>;
};

class NotificationService {
  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        caseId: input.caseId ?? null,
        type: input.type,
        title: input.title,
        body: input.body,
        isRead: false,
        meta: input.meta ?? {},
      })
      .returning();

    return created!;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return rows;
  }

  async markNotificationRead(id: number, userId: string): Promise<Notification | null> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    if (!updated) return null;
    return updated;
  }
}

export default new NotificationService();

