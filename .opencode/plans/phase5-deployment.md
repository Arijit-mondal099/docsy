# Phase 5 — Testing & Deployment

## Goal
Ensure the application is production-ready with tests, environment configuration, CI/CD, and deployment.

## Steps

### 1. Testing Setup
- Install `vitest`, `@testing-library/react`, `@playwright/test`
- `vitest.config.ts` — unit test configuration
- `playwright.config.ts` — e2e test configuration

### 2. Unit Tests
- `lib/ai/embedding.test.ts` — PDF chunking logic, embedding pipeline
- `lib/ai/rag.test.ts` — query embedding + Pinecone search integration
- `lib/db/schema.test.ts` — Drizzle schema validation
- `app/api/documents/upload/route.test.ts` — upload validation, auth gating
- `app/api/chat/route.test.ts` — message validation, streaming response

### 3. E2E Tests
- Auth flow: register → login → logout → reset password
- Upload flow: drag PDF → see status → verify in list
- Chat flow: select document → send message → see streaming response
- Error flow: upload invalid file → see error toast
- Mobile responsive: verify layout at mobile breakpoints

### 4. Environment Configuration
- `.env.example` with all required variables and documentation
- Validate all env vars at startup (`lib/env.ts` with Zod schema)
- Add `NEXT_PUBLIC_APP_URL` for production URLs

### 5. CI/CD (GitHub Actions)
- `.github/workflows/ci.yml` — lint, type-check, unit test on PR to main
- `.github/workflows/deploy.yml` — build + deploy on push to main
- Add status badges to README

### 6. Deployment Config
- `next.config.ts` — image domains (Cloudinary), `output: 'standalone'`
- Vercel or Docker deployment instructions
- Database migration script for production (`db:migrate`)

### 7. Production Checklist
- [ ] Database connection pooling (Neon serverless)
- [ ] Rate limiting (upstream or custom middleware)
- [ ] CORS headers for API routes
- [ ] Security headers (helmet or Next.js headers config)
- [ ] Cookie security (SameSite, Secure, HttpOnly)
- [ ] Error monitoring (Sentry or similar)
- [ ] Logging (structured logging for API routes)
- [ ] Backup strategy for Neon + Pinecone

## Verification
- `pnpm test` passes (unit + e2e)
- CI pipeline passes on PR
- Application runs in production environment
- Smoke test: upload → chat → delete flow end-to-end
- `pnpm build` passes
