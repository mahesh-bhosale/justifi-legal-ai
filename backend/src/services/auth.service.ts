import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { and, eq, isNull } from 'drizzle-orm';
import type { Request } from 'express';
import { db } from '../db/index';
import { users, User, NewUser, refreshTokens } from '../models/schema';
import { generateToken } from '../utils/jwt';
import { SignupInput, LoginInput } from '../utils/validation';
import { clientIpFromRequest, hashClientIp } from '../utils/client-ip';

const REFRESH_TOKEN_BYTES = 48;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type AuthResult = {
  token: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
};

function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export class AuthService {
  private async issueRefreshToken(userId: string, req?: Request): Promise<string> {
    const raw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const tokenHash = hashRefreshToken(raw);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
      ipAddress: req ? hashClientIp(clientIpFromRequest(req)) : null,
      userAgent: req?.get('user-agent')?.slice(0, 512) ?? null,
    });
    return raw;
  }

  /**
   * Sign up a new user
   */
  async signup(userData: SignupInput, req?: Request): Promise<AuthResult> {
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email));

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const newUser: NewUser = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      verified: false,
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();
    const token = generateToken(createdUser);
    const refreshToken = await this.issueRefreshToken(createdUser.id, req);
    const { password: _, ...userWithoutPassword } = createdUser;

    return {
      token,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Login existing user
   */
  async login(credentials: LoginInput, req?: Request): Promise<AuthResult> {
    const userResult = await db.select().from(users).where(eq(users.email, credentials.email));

    if (userResult.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult[0];
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user);
    const refreshToken = await this.issueRefreshToken(user.id, req);
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Exchange refresh token for new access + refresh (rotation).
   */
  async refresh(rawRefresh: string, req?: Request): Promise<AuthResult | null> {
    const tokenHash = hashRefreshToken(rawRefresh);
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)))
      .limit(1);

    if (!row || row.expiresAt.getTime() < Date.now()) {
      return null;
    }

    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, row.id));

    const [userRow] = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
    if (!userRow) {
      return null;
    }

    const accessToken = generateToken(userRow);
    const newRefresh = await this.issueRefreshToken(userRow.id, req);
    const { password: _, ...userWithoutPassword } = userRow;

    return {
      token: accessToken,
      refreshToken: newRefresh,
      user: userWithoutPassword,
    };
  }

  async logout(rawRefresh?: string): Promise<void> {
    if (!rawRefresh) {
      return;
    }
    const tokenHash = hashRefreshToken(rawRefresh);
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.tokenHash, tokenHash));
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const userResult = await db.select().from(users).where(eq(users.id, userId));

    if (userResult.length === 0) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = userResult[0];
    return userWithoutPassword;
  }
}

export default new AuthService();
