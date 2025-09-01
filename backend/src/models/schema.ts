import { pgTable, uuid, varchar, boolean, timestamp, text, integer, serial, numeric, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Create proper PostgreSQL ENUMs
export const userRoleEnum = pgEnum('user_role', ['citizen', 'lawyer', 'admin']);
export const availabilityStatusEnum = pgEnum('availability_status', ['available', 'limited', 'unavailable']);

// Role enum for users (TypeScript types)
export const userRoles = ['citizen', 'lawyer', 'admin'] as const;
export type UserRole = typeof userRoles[number];

// Availability status enum for lawyer profiles (TypeScript types)
export const availabilityStatus = ['available', 'limited', 'unavailable'] as const;
export type AvailabilityStatus = typeof availabilityStatus[number];

// Users table schema
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('citizen'),
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

// Lawyer profiles table schema
export const lawyerProfiles = pgTable('lawyer_profiles', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  specializations: text('specializations').array().notNull(),
  yearsExperience: integer('years_experience').notNull(),
  bio: text('bio').notNull(),
  officeAddress: varchar('office_address', { length: 500 }).notNull(),
  serviceAreas: text('service_areas').array().notNull(),
  languages: text('languages').array().notNull(),
  education: jsonb('education').notNull(),
  barAdmissions: jsonb('bar_admissions').notNull(),
  hourlyRate: integer('hourly_rate'),
  consultationFee: integer('consultation_fee'),
  availabilityStatus: availabilityStatusEnum('availability_status').notNull().default('available'),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0.00'),
  casesHandled: integer('cases_handled').default(0),
  successRate: numeric('success_rate', { precision: 5, scale: 2 }).default('0.00'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type for lawyer profile data
export type LawyerProfile = typeof lawyerProfiles.$inferSelect;
export type NewLawyerProfile = typeof lawyerProfiles.$inferInsert;
