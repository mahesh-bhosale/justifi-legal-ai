DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_citizen_lawyer_unique'
  ) THEN
    ALTER TABLE "reviews"
      ADD CONSTRAINT "reviews_citizen_lawyer_unique"
      UNIQUE ("citizen_id", "lawyer_id");
  END IF;
END $$;

