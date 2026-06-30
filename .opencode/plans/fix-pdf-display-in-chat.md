# Fix PDF display in chat iframe

## Problem

Chat PDF iframe shows blank and browser initiates multiple downloads.
Cloudinary URL lacks `.pdf` extension → wrong Content-Type →
browser can't render inline.

## Root cause

`components/chat/chat-panel.tsx:152` uses `<iframe src={documentUrl}>`
with the raw Cloudinary URL that has no `.pdf` extension. Cloudinary
serves it without proper PDF content headers, so the browser downloads
instead of rendering inline.

## Fix

Create a Next.js proxy route at `/api/documents/[id]/pdf` that:

1. Fetches the PDF from Cloudinary server-side
2. Streams it back with correct headers:
   - `Content-Type: application/pdf`
   - `Content-Disposition: inline`
   - `Cache-Control: public, max-age=3600`

## Files changed

- **new** `app/api/documents/[id]/pdf/route.ts` — GET handler
- **edit** `components/chat/chat-panel.tsx` — replace `documentUrl`
  with `/api/documents/${documentId}/pdf`
- **edit** `app/(dashboard)/chat/[id]/page.tsx` — remove `documentUrl` prop
