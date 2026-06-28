# Phase 1 — Foundation (Completed)

## Goal
Scaffold the ChatPDF Next.js project with database, authentication, landing pages, and dashboard stub.

## Steps

### 1. Scaffold Next.js + Tailwind + shadcn/ui
- `pnpm create next-app@latest` in tmp dir, merge into project
- Initialize shadcn/ui (base-nova, neutral, CSS variables)
- Add primitives: button, card, input, label, separator, sonner, skeleton

### 2. Drizzle + Neon
- Install `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`, `tsx`
- `drizzle.config.ts` — schema path, PG dialect, DATABASE_URL
- `lib/db/index.ts` — Drizzle client with neon-http driver
- `lib/db/schema/index.ts` — `users`, `documents`, `chats`, `messages` tables

### 3. BetterAuth
- Install `better-auth`
- `lib/auth/config.ts` — email/password + Google OAuth, Drizzle adapter
- `lib/auth/client.ts` — `createAuthClient` for client-side
- `app/api/auth/[...all]/route.ts` — `toNextJsHandler`
- `proxy.ts` — Next.js 16 proxy (middleware replacement) with session check
- Auth pages: login, register, reset-password

### 4. Landing Page
- `app/(marketing)/layout.tsx` — nav + footer
- `app/(marketing)/page.tsx` — hero, features grid, CTA
- `app/(marketing)/features/page.tsx` — 6 feature cards
- `app/(marketing)/pricing/page.tsx` — Free / Pro tier cards

### 5. Dashboard Layout (stub)
- `app/(dashboard)/layout.tsx` — sidebar navigation, user avatar, session-gated
- `app/(dashboard)/dashboard/page.tsx` — welcome message, upload CTA

## Verification
- `pnpm build` passes with zero type/lint errors
- Routes: `/`, `/features`, `/pricing`, `/login`, `/register`, `/reset-password`, `/dashboard`

## Commit
`feat(phase1): scaffold nextjs 16 project with drizzle, betterauth, auth pages, landing page, and dashboard layout`
