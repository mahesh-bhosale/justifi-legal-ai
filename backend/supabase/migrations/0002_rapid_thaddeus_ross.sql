CREATE TABLE "lawyer_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"specializations" text[] NOT NULL,
	"years_experience" integer NOT NULL,
	"bio" text NOT NULL,
	"office_address" varchar(500) NOT NULL,
	"service_areas" text[] NOT NULL,
	"languages" text[] NOT NULL,
	"education" jsonb NOT NULL,
	"bar_admissions" jsonb NOT NULL,
	"hourly_rate" integer,
	"consultation_fee" integer,
	"availability_status" varchar(20) DEFAULT 'available' NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"cases_handled" integer DEFAULT 0,
	"success_rate" numeric(5, 2) DEFAULT '0.00',
	"verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "lawyer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "lawyer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;