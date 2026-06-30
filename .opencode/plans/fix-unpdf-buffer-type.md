# Fix unpdf Buffer type error in processPdf

## Problem

`extractText` from `unpdf` expects `Uint8Array`, not Node.js `Buffer`.
`Buffer.from()` creates a Buffer instance, which unpdf rejects with:
"Please provide binary data as `Uint8Array`, rather than `Buffer`."

This causes background `processPdf` calls to fail silently — the API
returns 202 immediately, but the document status reverts to `error`.

## Root cause

`lib/ai/embedding.ts:45` — `Buffer.from(await response.arrayBuffer())`
creates a `Buffer`, but `extractText(pdfBuffer)` on line 48 wants `Uint8Array`.

## Fix

Replace `Buffer.from()` with `new Uint8Array()` on line 45.

## Files changed

- `lib/ai/embedding.ts` — one-line change
