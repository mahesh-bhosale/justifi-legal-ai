import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

// Role enum for users
export const userRoles = ['citizen', 'lawyer', 'admin'] as const;
export type UserRole = typeof userRoles[number];

// Users table schema
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 10 }).notNull().default('citizen'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Type for user data
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
