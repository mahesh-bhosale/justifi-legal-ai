import { db } from '../db';
import { users, type User } from '../models/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface PublicProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt: Date | null;
}

class ProfileService {
  async getCurrentUser(userId: string): Promise<PublicProfile | null> {
    const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const row = rows[0];
    if (!row) return null;

    const { password, ...rest } = row as User & { password: string };
    return rest as unknown as PublicProfile;
  }

  async updateCurrentUser(
    userId: string,
    data: { name?: string },
  ): Promise<PublicProfile> {
    const [updated] = await db
      .update(users)
      .set({
        ...(data.name ? { name: data.name } : {}),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      throw new Error('User not found');
    }

    const { password, ...rest } = updated as User & { password: string };
    return rest as unknown as PublicProfile;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = rows[0] as User & { password: string } | undefined;

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid current password');
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({ password: hash })
      .where(eq(users.id, userId));
  }
}

export default new ProfileService();

