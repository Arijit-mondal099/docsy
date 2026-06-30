# Fix PDF X-Frame-Options — scoped override

## Problem

PDF viewer iframe is blocked by X-Frame-Options. Browser downloads the full PDF (184 kB) but refuses to render it in-frame. Console shows:

```
Refused to display 'http://localhost:3000/' in a frame because it set 'X-Frame-Options' to 'deny'.
```

## Root cause

`next.config.ts:19-34` applies `X-Frame-Options` globally via `source: '/(.*)'`. The previous fix changed the value from `DENY` to `SAMEORIGIN` globally (commit 4adfb37), but this relaxes the header on ALL routes (dashboard, login, landing, etc.) — too broad.

## Fix

1. Restore `X-Frame-Options: DENY` in the global `source: '/(.*)'` rule
2. Add a SECOND header rule AFTER the global one specifically for the PDF route that overrides to `SAMEORIGIN`

```
source: '/(.*)'                        → X-Frame-Options: DENY       (global default)
source: '/api/documents/:id/pdf'       → X-Frame-Options: SAMEORIGIN (override for PDF)
```

Next.js applies headers in order; the last matching rule's value wins for each key.

## File changed

- `next.config.ts` — two changes: restore DENY globally, add scoped SAMEORIGIN for PDF route

## Verification

- `pnpm typecheck && pnpm test` pass
- PDF route response has `X-Frame-Options: SAMEORIGIN` → PDF displays in iframe
- Dashboard/landing/login all still have `X-Frame-Options: DENY` → protected
