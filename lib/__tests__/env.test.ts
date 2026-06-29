import { describe, it, expect, beforeEach, vi } from 'vitest';

/** Set process.env to only the given entries (starts clean each time). */
function setEnv(entries: Record<string, string>) {
  process.env = { NODE_ENV: 'test', ...entries };
}

function fullValidEnv(): Record<string, string> {
  return {
    DATABASE_URL: 'postgresql://user:pass@host:5432/db',
    BETTER_AUTH_URL: 'http://localhost:3000',
    BETTER_AUTH_SECRET: 'a'.repeat(32),
    GOOGLE_CLIENT_ID: 'google-id',
    GOOGLE_CLIENT_SECRET: 'google-secret',
    OPENAI_API_KEY: 'sk-abc123',
    PINECONE_API_KEY: 'pinecone-key',
    PINECONE_INDEX: 'chatpdf',
    CLOUDINARY_CLOUD_NAME: 'cloud',
    CLOUDINARY_API_KEY: 'cloud-key',
    CLOUDINARY_API_SECRET: 'cloud-secret',
  };
}

beforeEach(() => {
  vi.resetModules();
});

describe('env validation', () => {
  it('returns parsed env when all vars are valid', async () => {
    setEnv(fullValidEnv());
    const { getEnv } = await import('@/lib/env');
    const env = getEnv();
    expect(env.DATABASE_URL).toBe('postgresql://user:pass@host:5432/db');
    expect(env.OPENAI_API_KEY).toBe('sk-abc123');
  });

  it('throws when a required var is missing', async () => {
    setEnv({ ...fullValidEnv(), DATABASE_URL: '' });
    const { getEnv } = await import('@/lib/env');
    expect(() => getEnv()).toThrow('Invalid or missing environment variables');
  });

  it('throws when OPENAI_API_KEY does not start with sk-', async () => {
    setEnv({ ...fullValidEnv(), OPENAI_API_KEY: 'invalid-key' });
    const { getEnv } = await import('@/lib/env');
    expect(() => getEnv()).toThrow(/OPENAI_API_KEY/);
  });

  it('throws when BETTER_AUTH_SECRET is too short', async () => {
    setEnv({ ...fullValidEnv(), BETTER_AUTH_SECRET: 'short' });
    const { getEnv } = await import('@/lib/env');
    expect(() => getEnv()).toThrow(/BETTER_AUTH_SECRET/);
  });

  it('uses default BETTER_AUTH_URL when not provided', async () => {
    const { BETTER_AUTH_URL: _, ...rest } = fullValidEnv();
    setEnv(rest as Record<string, string>);
    const { getEnv } = await import('@/lib/env');
    const env = getEnv();
    expect(env.BETTER_AUTH_URL).toBe('http://localhost:3000');
  });

  it('accepts optional NEXT_PUBLIC_APP_URL', async () => {
    setEnv({ ...fullValidEnv(), NEXT_PUBLIC_APP_URL: 'https://example.com' });
    const { getEnv } = await import('@/lib/env');
    const env = getEnv();
    expect(env.NEXT_PUBLIC_APP_URL).toBe('https://example.com');
  });
});
