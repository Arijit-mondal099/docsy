import { defineConfig } from 'drizzle-kit';

// Load .env.local so drizzle-kit can find DATABASE_URL
try {
  process.loadEnvFile('.env.local');
} catch {
  // .env.local may not exist in production CI
}

export default defineConfig({
  schema: './lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});