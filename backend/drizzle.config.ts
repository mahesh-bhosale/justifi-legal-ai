import path from 'path';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
