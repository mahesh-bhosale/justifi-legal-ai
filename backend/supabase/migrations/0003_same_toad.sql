CREATE TABLE "case_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"prediction" text NOT NULL,
	"confidence" numeric,
	"confidence_level" text,
	"num_chunks" integer,
	"avg_chunk_confidence" numeric,
	"min_chunk_confidence" numeric,
	"max_chunk_confidence" numeric,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_predictions" ADD CONSTRAINT "case_predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;