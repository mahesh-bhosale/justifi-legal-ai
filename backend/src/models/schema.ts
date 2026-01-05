import { pgTable, uuid, varchar, boolean, timestamp, text, integer, serial, numeric, jsonb, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

// Create proper PostgreSQL ENUMs
export const userRoleEnum = pgEnum('user_role', ['citizen', 'lawyer', 'admin']);
export const availabilityStatusEnum = pgEnum('availability_status', ['available', 'limited', 'unavailable']);

// Matching & proposal enums
export const caseStatusEnum = pgEnum('case_status', ['pending','pending_lawyer_acceptance','in_progress','resolved','closed','rejected']);
export const proposalStatusEnum = pgEnum('proposal_status', ['pending','accepted','rejected','withdrawn']);
export const urgencyEnum = pgEnum('urgency_level', ['low','medium','high']);

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

// Cases table
export const cases = pgTable('cases', {
  id: serial('id').primaryKey(),
  citizenId: uuid('citizen_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lawyerId: uuid('lawyer_id').references(() => users.id, { onDelete: 'set null' }),
  preferredLawyerId: uuid('preferred_lawyer_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  status: caseStatusEnum('status').notNull().default('pending'),
  urgency: urgencyEnum('urgency').notNull().default('medium'),
  preferredLanguage: varchar('preferred_language', { length: 50 }),
  location: varchar('location', { length: 255 }),
  budget: numeric('budget', { precision: 15, scale: 2 }),
  nextHearingDate: timestamp('next_hearing_date', { withTimezone: true }),
  resolution: text('resolution'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Case proposals table
export const caseProposals = pgTable('case_proposals', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  lawyerId: uuid('lawyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  proposalText: text('proposal_text').notNull(),
  proposedFee: numeric('proposed_fee', { precision: 12, scale: 2 }),
  estimatedDuration: varchar('estimated_duration', { length: 100 }),
  status: proposalStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqueCaseLawyer: uniqueIndex('uq_case_lawyer').on(t.caseId, t.lawyerId)
}));

// Case documents table
export const caseDocuments = pgTable('case_documents', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileUrl: text('file_url').notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  fileSize: integer('file_size'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Case messages table
export const caseMessages = pgTable('case_messages', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: uuid('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Case updates table
export const caseUpdates = pgTable('case_updates', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  updatedBy: uuid('updated_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  updateType: varchar('update_type', { length: 50 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').notNull().unique().references(() => cases.id, { onDelete: 'cascade' }),
  citizenId: uuid('citizen_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lawyerId: uuid('lawyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Subscription status enum
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'past_due',
  'expired',
  'trial',
]);

// Plans table
export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents'),
  currency: varchar('currency', { length: 10 }).default('INR'),
  isUnlimited: boolean('is_unlimited').default(false),
  summarizeLimitPerDay: integer('summarize_limit_per_day').default(0),
  askLimitPerDay: integer('ask_limit_per_day').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: integer('plan_id').references(() => plans.id, { onDelete: 'set null' }),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  externalSubscriptionId: varchar('external_subscription_id', { length: 255 }),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    userPlanIdx: uniqueIndex('subscriptions_user_plan_idx').on(table.userId, table.planId),
  };
});

// AI Usage table (update if already exists)
export const aiUsage = pgTable('ai_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  endpoint: varchar('endpoint', { length: 50 }).notNull(),
  usageDate: timestamp('usage_date', { withTimezone: true }).defaultNow(),
  usageCount: integer('usage_count').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Types
export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;

export type CaseProposal = typeof caseProposals.$inferSelect;
export type NewCaseProposal = typeof caseProposals.$inferInsert;

export type CaseDocument = typeof caseDocuments.$inferSelect;
export type NewCaseDocument = typeof caseDocuments.$inferInsert;

export type CaseMessage = typeof caseMessages.$inferSelect;
export type NewCaseMessage = typeof caseMessages.$inferInsert;

export type CaseUpdate = typeof caseUpdates.$inferSelect;
export type NewCaseUpdate = typeof caseUpdates.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type AIUsage = typeof aiUsage.$inferSelect;
export type NewAIUsage = typeof aiUsage.$inferInsert;
