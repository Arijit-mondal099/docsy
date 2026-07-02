# Fix RAG scope and ownership

## Task

1. Fix the LLM to **only** answer based on the selected PDF — not general knowledge, not other documents
2. Fix the ownership gap so user A **cannot** access user B's PDF chunks via the chat API, and vice versa

## Files changed

### Must change

- `app/api/chat/route.ts` — two changes:
  - Add `eq(chats.userId, session.user.id)` to the chat lookup (ownership fix)
  - Rewrite system prompt to strictly forbid external knowledge
- `lib/ai/rag.ts` — return structured `{ text; documentId; chunkIndex }[]` instead of `string[]`

### Likely change

- `app/api/chat/route.ts` lines 111, 114-115 — update to use new return shape

### Read-only (not changing)

- `lib/ai/pinecone.ts` — namespace logic unchanged
- `lib/ai/embedding.ts` — no change needed
- `lib/__tests__/chat-route.test.ts` — no change needed (tests use mocked RAG)

### Out of scope

- Other API routes — already have ownership checks
- UI components
- Billing/usage

## Implementation steps

1. `app/api/chat/route.ts`: Add ownership check on chat lookup
2. `lib/ai/rag.ts`: Return structured chunk data with documentId filter
3. `app/api/chat/route.ts`: Rewrite system prompt to be strict
4. Verify with `pnpm typecheck && pnpm test`
