# Google OAuth sign-in returns 500

## Task

Diagnose and fix 500 error on `POST /api/auth/sign-in/social` when logging in with Google via Better Auth.

## Root cause

Better Auth's required DB tables (`user`, `session`, `account`, `verification`) are missing from the Drizzle schema. The schema only defines application tables (`users`, `documents`, `usage`, `chats`, `messages`).

When Better Auth tries to persist an OAuth state/verification token during the social sign-in flow, the Drizzle adapter's `getSchema()` (`@better-auth/drizzle-adapter/dist/index.mjs:81`) looks up `schema["user"]` in `db._.fullSchema` and fails with `BetterAuthError`. This surfaces as an uncaught 500.

## Trace

1. Client calls `authClient.signIn.social({ provider: 'google' })` (`app/(auth)/login/page.tsx:40`)
2. POST to `/api/auth/sign-in/social` → `app/api/auth/[...all]/route.ts` → `toNextJsHandler(auth.handler)`
3. Better Auth handler tries DB operation (verification token / session creation)
4. Drizzle adapter `getSchema("user")` fails — key not found in schema object
5. Uncaught `BetterAuthError` → HTTP 500

## Fix (Option A)

Rename `users` → `user`, add missing fields (`emailVerified`, `image`, `updatedAt`), and add `session`, `account`, `verification` tables. Update FK references.

## Files changed

- `lib/db/schema/index.ts` — schema rewrite
- `drizzle/` — new migration (auto-generated)
