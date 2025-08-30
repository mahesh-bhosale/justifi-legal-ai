import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: '.env' }); // or .env.local

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL, {
  onnotice: () => {},
  connect_timeout: 10,
});

// Test the connection
client`SELECT 1`.then(() => {
  console.log('✅ Database connected successfully');
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
});

export const db = drizzle({ client });
