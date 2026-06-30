# Fix PDF not showing in chat

## Problem

PDF iframe in the chat panel shows "infinite loading" / PDF content never appears.

## Root causes found & fixed

### 1. Content-Type validation was too strict (PRIMARY CAUSE)

The proxy route checked `cloudinaryContentType.includes('application/pdf')` and rejected anything else. **Cloudinary serves raw uploads as `application/octet-stream`**, not `application/pdf`. This meant ALL documents were rejected as "older document needs re-upload".

**Fix:** Changed validation to only reject `text/html` (which indicates old documents with `image/upload/` Cloudinary URLs). Both `application/pdf` and `application/octet-stream` are now accepted.

**File:** `app/api/documents/[id]/pdf/route.ts` line 52

### 2. Missing iframe `onError` handler

The refactored chat panel removed the `onError` handler that existed in the committed version. If the iframe encountered a network error, the skeleton would stay forever.

**Fix:** Re-added `onError` handler that sets `pdfError = true` and `pdfLoaded = true`.

**File:** `components/chat/chat-panel.tsx` line 154-157

### 3. Cloudinary fetch had no timeout

`fetch(doc.cloudinaryUrl)` had no timeout and could hang indefinitely, causing the route handler to never respond.

**Fix:** Added `AbortController` with 15s timeout. If Cloudinary takes >15s, returns 504 with clear error message.

**File:** `app/api/documents/[id]/pdf/route.ts` lines 35-36, 79-84

## Files changed

- `app/api/documents/[id]/pdf/route.ts`
- `components/chat/chat-panel.tsx`

## Verification

- `pnpm typecheck` — passes
- `pnpm test` — 10/10 passes
