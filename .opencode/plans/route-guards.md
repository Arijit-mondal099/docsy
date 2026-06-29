# Route Guards — Authenticated/Unauthenticated Redirection

## Task

Add route-level redirection guards so that:

- **Authenticated users** visiting marketing (`/`) or auth (`/login`, `/register`, `/reset-password`) routes → redirect to `/dashboard`
- **Unauthenticated users** visiting `/dashboard/*` → redirect to `/login`

---

## What I Found

### Current protection (3 layers)

| Layer            | File                                            | What it does                                                                                                                                                               |
| ---------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Middleware       | `proxy.ts`                                      | Blocks unauthenticated users from non-public routes (redirects to `/login`). Allows authenticated users on ALL public routes — no redirect from landing/auth to dashboard. |
| Auth layout      | `app/(auth)/layout.tsx` (server component)      | Checks session `auth.api.getSession()`. If authenticated → `redirect('/dashboard')`. **Already correct.**                                                                  |
| Dashboard layout | `app/(dashboard)/layout.tsx` (server component) | Checks session. If **not** authenticated → `redirect('/login')`. **Already correct.**                                                                                      |

### The gap

`app/(marketing)/layout.tsx` is a `'use client'` component (theme toggle, mobile sheet state) with **no session guard**. An authenticated user visiting `/` sees the full landing page. The layout cannot use `auth.api.getSession()` directly because it's a client component.

### Middleware (`proxy.ts`) — current behavior

```ts
const publicRoutes = ['/login', '/register', '/reset-password', '/'];
const publicPrefixes = ['/_next', '/api', '/favicon'];
```

- `/` is in `publicRoutes` — **always allowed**, even for authenticated users
- `/login`, `/register`, `/reset-password` are in `publicRoutes` — **always allowed**; the auth layout catches authenticated users server-side
- Protected routes → fetches session via `/api/auth/get-session`; if no user → redirect to `/login`

### Route structure

```
app/
  (auth)/         login, register, reset-password   ← guarded by layout (server)
  (dashboard)/    dashboard/*                        ← guarded by layout (server)
  (marketing)/    landing page (/), features, etc.   ← NOT guarded
  api/            API routes (auth, chat, etc.)
```

### Environment

- `lib/auth/config.ts` — Better Auth server instance (`auth`), has `auth.api.getSession()`
- `lib/auth/client.ts` — Better Auth client (`authClient` for browser)
- `lib/env.ts` — Zod env validation, used in `proxy.ts` at startup
- No existing tests for `proxy.ts` — no test breakage

---

## Files That Will Change

**Must change:**

- `proxy.ts` — add authenticated-user redirect from public/auth routes to `/dashboard`

**Likely change:**

- (none — all existing layout guards remain untouched)

**Risk zone (not changing, but watch):**

- `app/(marketing)/layout.tsx` — still a client component; middleware handles the guard now, but if someone later adds server-side logic here, ensure consistency
- `app/(auth)/layout.tsx` — already guarded; middleware adds a first-line defense that is redundant but harmless

---

## What I Am Not Touching

- `app/(marketing)/layout.tsx` — no structural changes; middleware handles the marketing route guard
- `app/(auth)/layout.tsx` — stays as-is (defense in depth)
- `app/(dashboard)/layout.tsx` — stays as-is (defense in depth)
- `lib/auth/config.ts` — no changes
- `lib/auth/client.ts` — no changes
- Any API routes — no changes
- Any tests — no existing tests break

---

## Implementation Steps

### 1. [proxy.ts] Redesign route categories and guard logic

Separate routes into three categories:

```ts
// Always allowed without any session check
const publicPrefixes = ['/_next', '/api', '/favicon'];

// Auth/marketing routes — if authenticated → redirect to /dashboard
const authRoutes = ['/', '/login', '/register', '/reset-password'];
```

New middleware logic:

```
1. If path starts with publicPrefix → allow (NextResponse.next())
2. Try to get session via /api/auth/get-session
3. If session found (user is authenticated):
   a. If path is in authRoutes → redirect to /dashboard
   b. Otherwise → allow (NextResponse.next())
4. If no session (user is NOT authenticated):
   a. If path is in authRoutes → allow (show login/register/landing)
   b. Otherwise → redirect to /login
```

**Why this approach:**

- Single file change — middleware runs before layouts (faster guard)
- No need to refactor `(marketing)/layout.tsx` from `'use client'`
- Auth and dashboard layouts remain as defense-in-depth layers
- `/api` stays public so the middleware can call `/api/auth/get-session`

**Why NOT refactor marketing layout to server component:**

- The layout has interactive state (theme toggle, mobile sheet open/close) requiring `'use client'`
- Splitting into server wrapper + client inner component is ~50 lines of churn for no runtime benefit since middleware already guards

### 2. Verify

- `pnpm typecheck` — ensures no type errors
- `pnpm test` — ensures no test regressions
- Manual: visit `/` as authenticated user → should get redirected to `/dashboard`
- Manual: visit `/dashboard` as unauthenticated → should get redirected to `/login`

---

## Risks & Unknowns

- **Middleware fetch to `/api/auth/get-session`**: The middleware does a fetch to itself. If the fetch fails (network error, timeout), the catch block currently falls through to redirect. This is existing behavior, not introduced by this change.
- **Double redirect**: If middleware redirects authenticated user from `/` to `/dashboard`, and then dashboard layout also checks session — this is fine. Dashboard layout just renders the page. No redirect loop.
- **Edge runtime**: `proxy.ts` runs on Edge. The fetch-based session check is the standard pattern for Edge middleware with Better Auth.

---

## Blockers

NONE

---

## Waiting For Approval

Does this plan look correct?

Reply with:
✅ go ahead — start implementation in order
✏️ adjust — correct scope, steps, or assumptions
❌ stop — task has changed or blockers need resolving first
