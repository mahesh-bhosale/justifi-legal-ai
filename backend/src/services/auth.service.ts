import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { users, User, NewUser } from '../models/schema';
import { generateToken } from '../utils/jwt';
import { SignupInput, LoginInput } from '../utils/validation';

export class AuthService {
  /**
   * Sign up a new user
   * @param userData - User registration data
   * @returns JWT token and user info (without password)
   */
  async signup(userData: SignupInput): Promise<{ token: string; user: Omit<User, 'password'> }> {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email));
      
      if (existingUser.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password with bcrypt (salt rounds: 12)
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create new user
      const newUser: NewUser = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        verified: false,
      };

      // Insert user into database
      const [createdUser] = await db.insert(users).values(newUser).returning();

      // Generate JWT token
      const token = generateToken(createdUser);

      // Return token and user info (without password)
      const { password, ...userWithoutPassword } = createdUser;
      
      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login existing user
   * @param credentials - User login credentials
   * @returns JWT token and user info (without password)
   */
  async login(credentials: LoginInput): Promise<{ token: string; user: Omit<User, 'password'> }> {
    try {
      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, credentials.email));
      
      if (userResult.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = userResult[0];

      // Compare password with bcrypt
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken(user);

      // Return token and user info (without password)
      const { password, ...userWithoutPassword } = user;
      
      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User info (without password) or null
   */
  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const userResult = await db.select().from(users).where(eq(users.id, userId));
      
      if (userResult.length === 0) {
        return null;
      }

      const { password, ...userWithoutPassword } = userResult[0];
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
