CREATE TYPE "public"."availability_status" AS ENUM('available', 'limited', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('citizen', 'lawyer', 'admin');--> statement-breakpoint
ALTER TABLE "lawyer_profiles" ALTER COLUMN "availability_status" SET DEFAULT 'available'::"public"."availability_status";--> statement-breakpoint
ALTER TABLE "lawyer_profiles" ALTER COLUMN "availability_status" SET DATA TYPE "public"."availability_status" USING "availability_status"::"public"."availability_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'citizen'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";