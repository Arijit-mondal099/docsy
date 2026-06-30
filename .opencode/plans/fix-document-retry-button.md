# Fix Document Retry Button

## Problem

The "Retry" button on failed documents (`status === 'error'`) shows a toast
"Re-processing will be available in a future update" instead of actually
re-processing the PDF.

## Solution

Create a `POST /api/documents/[id]/reprocess` endpoint that re-triggers
`processPdf` on the existing Cloudinary URL, then wire up the Retry button
in the Documents page to call it.

## Files changed

- **new** `app/api/documents/[id]/reprocess/route.ts` — POST handler
- **edit** `lib/api.ts` — add `reprocessDocument(id)` fetch helper
- **edit** `app/(dashboard)/documents/page.tsx` — wire Retry via mutation

## Design decisions

- Reprocess does **not** count toward the monthly upload limit (the document
  was already uploaded once; retry is free)
- The endpoint validates session and document ownership before proceeding
- On success → status → `ready`; on failure → status → `error`
- Uses the existing `processPdf(pdfUrl, documentId)` from `lib/ai/embedding`
