import { db } from '../db';
import { users, type User } from '../models/schema';

export interface PublicUser extends Omit<User, 'password'> {}

class UsersService {
  async listAll(): Promise<{
    citizens: PublicUser[];
    lawyers: PublicUser[];
    admins: PublicUser[];
  }> {
    const rows = await db.select().from(users);

    const withoutPassword = rows.map(({ password, ...rest }) => rest);

    return {
      citizens: withoutPassword.filter((u) => u.role === 'citizen'),
      lawyers: withoutPassword.filter((u) => u.role === 'lawyer'),
      admins: withoutPassword.filter((u) => u.role === 'admin'),
    };
  }
}

export default new UsersService();

