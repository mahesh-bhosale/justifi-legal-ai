import { pgTable, uuid, varchar, boolean, timestamp, text, integer, serial } from 'drizzle-orm/pg-core';

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

// Blog posts table schema
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  author: varchar('author', { length: 100 }),
  readTime: integer('read_time'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type for user data
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Type for blog post data
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
