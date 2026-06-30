import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Hoisted mock references — vitest hoists these above vi.mock() calls
const mockGetSession = vi.hoisted(() => vi.fn());
const mockDbSelect = vi.hoisted(() => vi.fn());
const mockDbInsert = vi.hoisted(() => vi.fn());
const mockDbUpdate = vi.hoisted(() => vi.fn());
const mockTryIncrement = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock('@/lib/db', () => ({
  db: { select: mockDbSelect, insert: mockDbInsert, update: mockDbUpdate },
}));

vi.mock('@/lib/ai/rag', () => ({
  searchDocumentChunks: vi.fn().mockResolvedValue([]),
  getChatModel: vi.fn(),
}));

vi.mock('@/lib/db/usage', () => ({
  tryIncrementMessagesSent: mockTryIncrement,
}));

vi.mock('ai', () => ({
  streamText: vi.fn(),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ field: a, value: b })),
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { auth } from '@/lib/auth/config';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { db } from '@/lib/db';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { tryIncrementMessagesSent } from '@/lib/db/usage';

const { POST } = await import('@/app/api/chat/route');

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockSession(user?: { id: string; email: string } | null) {
  mockGetSession.mockResolvedValue(user ? { user, session: { id: 'sess-1' } } : null);
}

/** Make db.select().from(table).where(condition).orderBy() resolve to result */
function mockSelectResult(result: unknown[]) {
  mockDbSelect.mockReturnValue({
    from: () => ({
      where: () => ({
        orderBy: () => ({
          then: (fn: (rows: unknown[]) => unknown) => Promise.resolve(fn(result)),
        }),
        then: (fn: (rows: unknown[]) => unknown) => Promise.resolve(fn(result)),
      }),
    }),
  });
}

/** Make db.insert(table).values(data).returning() resolve to rows */
function mockInsertReturning(rows: unknown[]) {
  mockDbInsert.mockReturnValue({
    values: () => ({
      returning: vi.fn().mockResolvedValue(rows),
    }),
  });
}

/** Make db.update(table).set(data).where(condition) resolve silently */
function mockUpdateWhere() {
  mockDbUpdate.mockReturnValue({
    set: () => ({
      where: () => Promise.resolve(),
    }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/chat', () => {
  it('returns 401 when not authenticated', async () => {
    mockSession(null);
    const req = createRequest({ messages: [{ role: 'user', content: 'hello' }] });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 400 when no user message', async () => {
    mockSession({ id: 'user-1', email: 'a@b.com' });
    const req = createRequest({ messages: [{ role: 'assistant', content: 'hello' }] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('No user message found');
  });

  it('returns 400 when chatId and documentId are both missing', async () => {
    mockSession({ id: 'user-1', email: 'a@b.com' });
    const req = createRequest({ messages: [{ role: 'user', content: 'hello' }] });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/chatId or documentId/);
  });

  it('returns 429 when usage limit reached', async () => {
    mockSession({ id: 'user-1', email: 'a@b.com' });

    // No existing chat — will create one via documentId path
    mockSelectResult([]);
    mockInsertReturning([{ id: 'chat-1', documentId: 'doc-1' }]);
    mockUpdateWhere();

    mockTryIncrement.mockResolvedValue({
      allowed: false,
      reason: 'Monthly message limit reached',
    });

    const req = createRequest({
      messages: [{ role: 'user', content: 'hello' }],
      documentId: 'doc-1',
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Monthly message limit reached');
  });
});
