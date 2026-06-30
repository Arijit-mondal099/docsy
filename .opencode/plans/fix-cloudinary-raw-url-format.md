# Fix Cloudinary raw upload URL serving empty PDF

## Problem

`processPdf` fetches PDF from `cloudinaryUrl` but receives zero bytes.
unpdf throws `InvalidPDFException: The PDF file is empty`.

## Root cause

`lib/cloudinary/index.ts:19` — `format: 'pdf'` alongside `resource_type: 'raw'`.
The `format` param signals image transformation intent to Cloudinary, so
`secure_url` returns a delivery URL that serves an HTML preview instead of
the raw PDF binary. Server-side `fetch()` gets 0 bytes.

## Fix

Remove `format: 'pdf'` from the upload options. `resource_type: 'raw'` alone
is sufficient — Cloudinary preserves the original file extension.

## Files changed

- `lib/cloudinary/index.ts` — remove `format: 'pdf'` (line 19)
