ALTER TYPE "public"."case_status" ADD VALUE 'pending_lawyer_acceptance' BEFORE 'in_progress';--> statement-breakpoint
ALTER TYPE "public"."case_status" ADD VALUE 'rejected';--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "budget" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "preferred_lawyer_id" uuid;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_preferred_lawyer_id_users_id_fk" FOREIGN KEY ("preferred_lawyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;