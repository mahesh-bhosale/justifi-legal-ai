import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../models/schema';

// Create a new connection pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create and export the drizzle instance with the pool and schema
export const db = drizzle(pool, { 
  schema,
  logger: process.env.NODE_ENV !== 'production' // Enable query logging in development
});

// Export the pool in case it's needed for raw queries or transactions
export { pool };
