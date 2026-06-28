# Phase 4 — Polish & Feature Completion

## Goal
Add missing production features: document delete, usage limits, mobile responsive layout, and error boundaries.

## Steps

### 1. Document Delete
- `DELETE /api/documents/[id]` — validate ownership, delete from Neon, Cloudinary, and Pinecone namespace
- Confirmation dialog before delete (shadcn AlertDialog)
- Remove document card from list with optimistic update (TanStack Query)
- Handle edge cases: document is processing, document in active chat

### 2. Usage Limits
- Add `usage` table to Drizzle schema: `userId`, `documentsUploaded`, `messagesSent`, `resetDate`
- Increment counters on upload (POST /api/documents/upload) and chat (POST /api/chat)
- Free tier caps: 5 documents, 50 messages/month
- Return 429 when limits exceeded with clear error message
- Show usage badge in dashboard sidebar

### 3. Mobile Responsive
- Dashboard sidebar: convert to slide-over drawer on mobile (shadcn Sheet)
- Chat page: stack PDF viewer on top, chat below (currently hidden on mobile via `hidden md:block`)
- Documents page: card grid → single column on small screens
- Auth pages: full-width on mobile, centered card on desktop
- Marketing pages: stack feature cards vertically on mobile
- Test at 375px, 768px, 1024px breakpoints

### 4. Error Boundaries
- `components/error-boundary.tsx` — React error boundary wrapper for dashboard routes
- Toast notifications for API errors (sonner)
- Chat error state: retry button when streaming fails
- Upload error state: clear error message with retry option
- 404 page for unknown document/chat IDs
- 500 fallback page

### 5. Loading States
- Skeleton loaders for document list, chat message list, PDF iframe
- Suspense boundaries for async server components
- Page transition loading indicator (top progress bar)

## Verification
- Upload → delete document → confirm cleanup in Neon, Cloudinary, Pinecone
- Hit free tier limit → receive 429 error
- Dashboard and chat render correctly at mobile widths
- Network errors show toast + retry option
- `pnpm build` passes
