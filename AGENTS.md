# AGENTS.md

## What this project is

A full-stack Next.js app for chatting with PDFs using AI (OpenAI + Gemini). Users upload PDFs, embeddings go to Pinecone, and they ask questions against their documents. Auth via Better Auth + Google OAuth. Database: PostgreSQL via Drizzle ORM (Neon).

**This is NOT just an OpenCode config repo anymore** — real app code lives here. OpenCode config lives alongside source.

## Stack (verified)

| Layer        | What's in use                                                          |
| ------------ | ---------------------------------------------------------------------- |
| Framework    | Next.js 16.2 App Router (`output: "standalone"`)                       |
| UI           | React 19, Tailwind CSS v4, shadcn/ui (style: `base-nova`), Geist fonts |
| State        | TanStack Query, Zustand                                                |
| Auth         | Better Auth (not vanilla JWT) — httpOnly cookies, Google OAuth         |
| DB           | PostgreSQL (Neon serverless) + Drizzle ORM + `drizzle-kit`             |
| Vector       | Pinecone + LangChain embeddings                                        |
| AI           | OpenAI (`ai` SDK, `@ai-sdk/openai`), Google Gemini (`@ai-sdk/google`)  |
| File storage | Cloudinary                                                             |
| Build        | TypeScript strict, `@/*` path alias → root                             |
| Package mgr  | pnpm (corepack, frozen-lockfile in CI)                                 |

## Verification & commands (run in this order)

Pre-push hook enforces: `pnpm typecheck && pnpm test`

| Command            | What it does                                            |
| ------------------ | ------------------------------------------------------- |
| `pnpm dev`         | Start Next.js dev server                                |
| `pnpm typecheck`   | `tsc --noEmit`                                          |
| `pnpm lint`        | ESLint (flat config)                                    |
| `pnpm test`        | Vitest unit tests (jsdom, `lib/__tests__/`)             |
| `pnpm test:watch`  | Vitest watch mode                                       |
| `pnpm test:e2e`    | Playwright tests (`e2e/`) — requires dev server running |
| `pnpm build`       | Next.js build (standalone output)                       |
| `pnpm db:push`     | Push Drizzle schema to DB                               |
| `pnpm db:generate` | Generate Drizzle migrations                             |
| `pnpm db:migrate`  | Apply migrations                                        |
| `pnpm db:studio`   | Drizzle Studio                                          |

Unit test conventions: `vitest.config.ts` with jsdom, React plugin, `@/` alias. Test files match `**/*.test.{ts,tsx}`. E2E: Playwright Chrome only, single worker, base URL `http://localhost:3000`.

## Husky hooks

- **pre-commit:** `pnpm exec lint-staged` (ESLint + Prettier on staged `*.{ts,tsx,mjs,json,md,css}`)
- **pre-push:** `pnpm typecheck && pnpm test` (blocks push on type error or test failure)

Do not install or modify hooks manually — they live in `.husky/` and are auto-triggered via `husky` (v9).

## CI (GitHub Actions)

Runs on PR → `main`. Steps: pnpm install (frozen-lockfile) → typecheck → lint → unit tests. No e2e in CI.

## Project structure (key paths)

```
app/
  (auth)/       Auth pages (login, register, reset-password)
  (dashboard)/  Authenticated app (chat, document list)
  (marketing)/  Landing, features, pricing pages
  api/          Route handlers (auth, chat, documents, usage)
  layout.tsx    Root layout with Providers, fonts, `suppressHydrationWarning`
lib/
  ai/           OpenAI, Gemini, Pinecone, LangChain RAG pipeline
  auth/         Better Auth client + config
  db/           Drizzle schema, queries, usage tracking
  __tests__/    Vitest test files + setup
  env.ts        Zod env validation (validated at startup in proxy.ts)
  logger.ts     Structured logging (JSON in prod, readable in dev)
  utils.ts      cn() helper (clsx + tailwind-merge)
  api.ts        Shared fetch wrapper
components/
  ui/           shadcn/ui primitives
  chat/         Chat UI components
  pdf/          PDF viewer components
  dashboard/    Dashboard components
  providers.tsx Theme + QueryClient + Auth providers
proxy.ts        Next.js middleware — auth gate on protected routes
Dockerfile      Multi-stage build (node:22-alpine, standalone output)
```

## Env validation

Zod schema in `lib/env.ts`. Auto-validated at startup via `proxy.ts` (non-dev environments throw before first request). Required vars:

```
DATABASE_URL            PostgreSQL (Neon)
BETTER_AUTH_URL         Auth callback URL
BETTER_AUTH_SECRET      ≥ 32 chars
GOOGLE_CLIENT_ID        Google OAuth
GOOGLE_CLIENT_SECRET    Google OAuth
OPENAI_API_KEY          OpenAI (must start with sk-)
PINECONE_API_KEY        Pinecone
PINECONE_INDEX          Index name
CLOUDINARY_CLOUD_NAME   Cloudinary
CLOUDINARY_API_KEY      Cloudinary
CLOUDINARY_API_SECRET   Cloudinary
```

Optional: `NEXT_PUBLIC_APP_URL`

## OpenCode config (agents, commands, skills)

| Path                      | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `opencode.json`           | OpenCode config — instructions, agents, commands                     |
| `.opencode/agents/*.md`   | Agent definitions (dev, debugger, git, reviewer, db, ai-engineer)    |
| `.opencode/commands/*.md` | `/investigate`, `/review`, `/commit`, `/pr` workflows                |
| `CLAUDE.md`               | Behavioral guidelines (think first, simple code, surgical edits)     |
| `DESIGN.md`               | Anthropic/Claude design system reference — verbose, only for UI work |
| `.opencode/skills/`       | Installed skills — load with skill tool when relevant                |
| `.opencode/plans/`        | Plan storage directory — see Plan directive below                    |

## Plan directive

Whenever an agent creates a plan (feature design, investigation findings, architecture proposal, migration strategy, etc.), **save it to `.opencode/plans/<feature-name>.md`** before ending the session. Plans are persistent records — do not discard them or leave them in conversation context only.

## Agent delegation

| Task                                        | Delegate       |
| ------------------------------------------- | -------------- |
| Code review                                 | `@reviewer`    |
| Bug tracing                                 | `@debugger`    |
| Git/commit/PR                               | `@git`         |
| Schema design, query optimization           | `@db`          |
| RAG pipelines, embeddings, LLM integrations | `@ai-engineer` |

## Style & conventions

- **Commits:** Conventional commits: `type(scope): description`. Types: feat, fix, refactor, chore, style, test, docs, perf. One concern per commit.
- **Prettier:** semi, singleQuote, trailingComma all, printWidth 100, lf line endings
- **Imports:** `@/*` path alias maps to repo root. UI components from `@/components/ui/`.
- **shadcn/ui:** Style `base-nova`, not new-york. Components at `@/components/ui/`, config in `components.json`.
- **No `any`** — strict mode is enforced. No `as X` casts that lie.

## Known gotchas

- `.env.local` is committed (`.gitignore` has `!.env.example` but `.env.local` doesn't match the `!.env.example` exception, you'd expect it to be gitignored but it's actually tracked — check before touching env files)
- Design system ref (`DESIGN.md`) is 310 lines of Anthropic/Claude visual specs — only relevant for deliberate UI redesign toward that aesthetic
- `pnpm-lock.yaml` is large and changes often — avoid unnecessary lockfile churn
- `proxy.ts` validates env at module scope in non-dev — any env change requires server restart
- `next build` output is `standalone` — required for Docker; `.next/standalone` is what runs in prod
