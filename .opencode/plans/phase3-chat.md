# Phase 3 — Chat

## Goal
Enable AI-powered conversations with uploaded PDFs using RAG + streaming.

## Steps

### 1. Install packages
- `ai`, `@ai-sdk/openai`, `@ai-sdk/google`

### 2. RAG pipeline (`lib/ai/rag.ts`)
- Embed user query with OpenAI
- Search Pinecone namespace `doc-{documentId}` for top-k similar chunks
- Return chunk texts as context

### 3. Chat API (`POST /api/chat`)
- Accept `{ documentId, chatId?, message }`
- Validate session
- Create/update chat in Neon
- Save user message to DB
- Run RAG: embed query → search Pinecone → retrieve context
- Call `streamText` with GPT-4o (context + history + query)
- On OpenAI error → fallback to Gemini via `@ai-sdk/google`
- Stream text response to client
- After stream completes, save assistant message to DB

### 4. Chat UI Components (`components/chat/`)
- `ChatWindow` — split view: PDF viewer (left) + chat panel (right)
- `MessageBubble` — renders user/assistant messages, markdown support
- `ChatInput` — text input with send button, disabled during streaming

### 5. Chat Page (`app/(dashboard)/chat/[id]/page.tsx`)
- Fetch document + chat messages on load
- Render ChatWindow with PDF iframe + message list
- Auto-scroll on new messages
- Loading/error states

### 6. Integration
- Wire "Chat" button on documents page → navigates to `/chat/{id}`
- Create chat on first message if not exists

## Verification
- Open a document → start a chat → send message → see streaming response
- Messages saved in Neon (user + assistant)
- RAG returns context-relevant answers
- Fallback works when OpenAI key is misconfigured
- `pnpm build` passes
