# Fix: /chat route returns 404

## Problem
The dashboard sidebar links to `/chat` (line 93 in `components/dashboard/sidebar.tsx`), but no page exists at `app/(dashboard)/chat/page.tsx`. Only `app/(dashboard)/chat/[id]/page.tsx` exists. Navigating to `/chat` shows "Page not found".

## Root cause
Missing `page.tsx` at the `chat/` route level.

## Solution
Create `app/(dashboard)/chat/page.tsx` — a conversation list landing page that renders:
- `ChatSidebar` on the left panel (reused from the existing `[id]/page.tsx` layout)
- A centered placeholder on the right panel with "Select a conversation" prompt and "New Chat" button

## Files changed
- **CREATE** `app/(dashboard)/chat/page.tsx`

## Verification
- `/chat` renders the conversation list instead of 404
- Clicking a conversation navigates to `/chat/[id]`
- `pnpm typecheck` and `pnpm test` pass
