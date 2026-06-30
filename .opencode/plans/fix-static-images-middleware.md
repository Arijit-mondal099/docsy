# Fix: Static images not rendering (middleware intercept)

## Date

2026-06-30

## Task

Fix static images (`/logo.png`, `/hero.jpg`, `/cta-bg.jpg`) not rendering in the browser.
Server logs show: `⨯ The requested resource isn't a valid image for /logo.png received null`

## Root Cause

The Next.js middleware in `proxy.ts` is intercepting requests for static files in `public/`
and redirecting them to `/login` (307) because:

1. `proxy.ts:13` — `publicPrefixes` only includes `['/_next', '/api', '/favicon']`. No static file extensions (`.png`, `.jpg`, etc.) are allowed through.
2. `proxy.ts:60` — `matcher` excludes `_next/static`, `_next/image`, `favicon.ico` but NOT common static file extensions.
3. Call chain: Browser `GET /logo.png` → Middleware matches → No session cookie → Not an authRoute → Redirect to `/login` → Browser gets HTML, not image → `"received null"`

The `<img>` tags, `next.config.ts`, `public/` files, and standalone output are all correct.

## Files Changed

**Must change:**

- `proxy.ts:60` — update matcher regex to exclude static file extensions

**Not touched:**

- `next.config.ts` — correct, unrelated
- Any component files with `<img>` tags — correct, unrelated
- `public/` directory — files exist and are valid
- Any other part of the auth flow

## Implementation

```typescript
// Before (proxy.ts:60):
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

// After:
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)'],
};
```

This prevents the middleware from running at all for static file requests (better perf).

## Verification

1. `curl http://localhost:3000/logo.png` → `200 OK`, `Content-Type: image/png`
2. `curl http://localhost:3000/hero.jpg` → `200 OK`, `Content-Type: image/jpeg`
3. Login/dashboard routes still auth-gated correctly

## Risks

- Low risk — only affects middleware routing, one regex change
- If more static file types are needed later (fonts, `.css`, `.js`, `.woff2`, etc.), the regex must be extended
