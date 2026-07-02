<div align="center">
  <img src="./public/logo.png" alt="Docsy Logo" width="80" height="80" />
  <h1 align="center">Docsy</h1>
  <p align="center">
    Chat with your PDFs using AI — RAG-powered document intelligence with GPT-4o and Gemini.
    <br />
    <a href="https://github.com/Arijit-mondal099/docsy"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#getting-started">Getting Started</a>
    ·
    <a href="#features">Features</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#deployment">Deployment</a>
  </p>
</div>

<p align="center">
  <a href="https://github.com/Arijit-mondal099/docsy/actions/workflows/ci.yml">
    <img src="https://github.com/Arijit-mondal099/docsy/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript Strict" />
  <img src="https://img.shields.io/badge/pnpm-11-F69220" alt="pnpm 11" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791" alt="Neon PostgreSQL" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991" alt="GPT-4o" />
  <img src="https://img.shields.io/badge/Gemini-2.0_Flash-4285F4" alt="Gemini 2.0 Flash" />
  <img src="https://img.shields.io/badge/Razorpay-integrated-2D81FF" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Pinecone-vector_db-7B3FE4" alt="Pinecone" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED" alt="Docker" />
</p>

---

## Overview

Docsy is a full-stack SaaS application that lets you upload PDF documents and ask questions about their content using AI. It uses **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware answers by searching through your document's content before generating a response.

Built with Next.js 16 (App Router), powered by OpenAI GPT-4o and Google Gemini 2.0 Flash, with vector search via Pinecone and payments via Razorpay.

**Live use case:** Upload research papers, legal contracts, technical manuals, or any PDF — then ask questions conversationally.

---

## Features

- **AI-Powered Q&A** — Ask questions against your PDFs. Get answers grounded in the actual document content via RAG.
- **Dual AI Models** — Choose between GPT-4o (default) or Gemini 2.0 Flash. Automatic fallback if one model fails.
- **RAG Pipeline** — PDF text extraction (`unpdf`), LangChain chunking (1000-char chunks, 200-char overlap), OpenAI embeddings (`text-embedding-3-small`), Pinecone vector search (top-5 retrieval).
- **Streaming Responses** — Real-time token-by-token streaming via the `ai` SDK.
- **Multi-Document Management** — Upload, view, delete, and reprocess documents. 10MB max per PDF.
- **PDF Viewer** — In-browser iframe-based viewer with zoom, rotation, and fullscreen controls.
- **Conversation History** — Chats persist with full message history. Rename, search, and delete conversations.
- **Analytics Dashboard** — Usage stats, document status breakdown, message counts, quick actions.
- **User Authentication** — Email/password + Google OAuth via Better Auth. Session management with httpOnly cookies.
- **Subscription Plans** — Free (5 docs, 50 messages/month), Pro Monthly (₹19/mo, unlimited), Pro Yearly (₹190/yr, ~17% savings).
- **Usage Limits** — Atomic quota enforcement (prevents race conditions when checking limits).
- **Payment Processing** — Razorpay integration with order creation, payment verification, webhook handling, and payment history.
- **Responsive Design** — Desktop sidebar layout, mobile sheet drawer, adaptive grid layouts.
- **Dark Mode** — Theme toggle (light/dark/system) via `next-themes`.

---

## Tech Stack

| Category             | Technologies                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | [Next.js 16](https://nextjs.org/) (App Router, `output: "standalone"`)                                                              |
| **Language**         | [TypeScript](https://www.typescriptlang.org/) 5 (strict mode)                                                                       |
| **UI**               | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (base-nova)        |
| **Fonts**            | Geist (Plus Jakarta Sans + JetBrains Mono)                                                                                          |
| **State**            | [TanStack Query](https://tanstack.com/query) v5, Zustand, React Context                                                             |
| **Auth**             | [Better Auth](https://www.better-auth.com/) v1.6 (Drizzle adapter, Google OAuth, email/password)                                    |
| **Database**         | [Neon PostgreSQL](https://neon.tech/) (serverless), [Drizzle ORM](https://orm.drizzle.team/) v0.45, `drizzle-kit` v0.31             |
| **Vector DB**        | [Pinecone](https://www.pinecone.io/) v8                                                                                             |
| **Embeddings**       | OpenAI `text-embedding-3-small` (768 dimensions) via [LangChain](https://js.langchain.com/)                                         |
| **AI Models**        | [OpenAI GPT-4o](https://platform.openai.com/) + [Google Gemini 2.0 Flash](https://ai.google.dev/)                                   |
| **AI SDK**           | [Vercel AI SDK](https://sdk.vercel.ai/) v7 (`streamText`)                                                                           |
| **Payments**         | [Razorpay](https://razorpay.com/) v2.9 (orders, subscriptions, webhooks)                                                            |
| **File Storage**     | [Cloudinary](https://cloudinary.com/) (raw uploads for PDFs)                                                                        |
| **PDF Processing**   | [unpdf](https://www.npmjs.com/package/unpdf) (browser-compatible PDF text extraction)                                               |
| **Testing**          | [Vitest](https://vitest.dev/) v4 + [Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/) v1.61     |
| **CI/CD**            | [GitHub Actions](https://github.com/features/actions) (PR → main: typecheck, lint, test)                                            |
| **Linting**          | [ESLint](https://eslint.org/) v9 (flat config), [Prettier](https://prettier.io/) v3                                                 |
| **Git Hooks**        | [Husky](https://typicode.github.io/husky/) v9 + [lint-staged](https://github.com/lint-staged/lint-staged)                           |
| **Package Manager**  | [pnpm](https://pnpm.io/) 11 (corepack, frozen-lockfile)                                                                             |
| **Containerization** | [Docker](https://www.docker.com/) (multi-stage, node:22-alpine)                                                                     |
| **Icons**            | [Lucide](https://lucide.dev/)                                                                                                       |
| **Charts**           | [Recharts](https://recharts.org/)                                                                                                   |
| **Utilities**        | Zod, date-fns, clsx, tailwind-merge, class-variance-authority, sonner, react-markdown, rehype-highlight, remark-gfm, react-dropzone |

---

## Architecture

```
User Uploads PDF
       │
       ▼
Cloudinary (file storage)
       │
       ▼
unpdf (text extraction)
       │
       ▼
LangChain RecursiveCharacterTextSplitter (chunk: 1000, overlap: 200)
       │
       ▼
OpenAI text-embedding-3-small (768 dimensions)
       │
       ▼
Pinecone upsert (namespace: doc-{id}, batch: 100)
       │
       ▼
Document ready for Q&A
```

```
User asks a question
       │
       ▼
Embed query with same model
       │
       ▼
Pinecone similarity search (topK=5, same namespace)
       │
       ▼
Inject chunks as context into system prompt
       │
       ▼
streamText(GPT-4o or Gemini 2.0 Flash)
       │
       ▼
Stream tokens to client (with auto-fallback)
       │
       ▼
Save user + assistant messages to DB
```

### Key Design Decisions

- **Standalone output** (`next.config.ts`) — enables Docker deployment without Node.js server dependency.
- **Atomic usage limits** (`lib/db/usage.ts`) — SQL-level `WHERE` guard prevents race conditions on quota checks.
- **Server-side PDF proxy** — Cloudinary URLs are never exposed to the client; all PDFs stream through `/api/documents/[id]/pdf`.
- **Model fallback** — If the primary model fails, the chat retries automatically with the secondary model.
- **Receipt length guard** — Razorpay requires receipts ≤ 40 chars; the order route generates short hashed receipts (`ord_${crypto.randomUUID().slice(0,16)}`).

---

## Getting Started

### Prerequisites

- **Node.js** 22+
- **pnpm** 11 (enable via corepack: `corepack enable pnpm`)
- **PostgreSQL** database — [Neon](https://neon.tech/) (serverless, recommended) or any PostgreSQL instance
- **Pinecone** account — [create an index](https://www.pinecone.io/) (any pod type, 768 dimensions)
- **OpenAI** API key with access to `gpt-4o` and `text-embedding-3-small`
- **Google Gemini** API key (for fallback model)
- **Google Cloud Console** OAuth 2.0 credentials (for Google login)
- **Cloudinary** account (for PDF file storage)
- **Razorpay** account (for payments — use test mode for development)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<min 32 characters>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# AI
OPENAI_API_KEY=sk-...

# Vector Database
PINECONE_API_KEY=<your-pinecone-api-key>
PINECONE_INDEX=<your-index-name>

# File Storage
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Payments
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=<your-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Env vars are validated at startup via a Zod schema (`lib/env.ts`). In non-development environments, misconfiguration throws an error before the first request.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Arijit-mondal099/docsy.git
cd docsy

# 2. Install dependencies
pnpm install

# 3. Push the database schema
pnpm db:push

# 4. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Migrations

```bash
# Generate a new migration after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (GUI database browser)
pnpm db:studio
```

---

## Project Structure

```
docsy/
├── app/
│   ├── (auth)/                # Auth pages (login, register, reset-password)
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/           # Authenticated app
│   │   ├── billing/           # Subscription & payment management
│   │   ├── chat/[id]/         # Chat conversation
│   │   ├── dashboard/         # Analytics & usage stats
│   │   └── documents/         # Document list & upload
│   ├── (marketing)/           # Public landing pages
│   │   ├── page.tsx           # Landing page (hero, features, pricing)
│   │   └── layout.tsx         # Marketing layout (navbar, footer, auth modal)
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth handler
│   │   ├── chat/              # Core chat streaming endpoint
│   │   ├── chats/             # Chat CRUD
│   │   ├── documents/         # Document upload, proxy, delete, reprocess
│   │   ├── payments/          # Razorpay (create-order, verify, webhook, subscription, history)
│   │   └── usage/             # Usage stats & dashboard analytics
│   ├── layout.tsx             # Root layout (fonts, providers, toaster)
│   └── globals.css            # Tailwind v4 + CSS variables + themes
├── components/
│   ├── auth/                  # Auth modal, context
│   ├── chat/                  # Chat panel, sidebar, input, messages, model selector
│   ├── dashboard/             # Sidebar navigation, stat cards
│   ├── landing/               # Hero, features, pricing, testimonials, CTA
│   ├── pdf/                   # PDF viewer, upload dropzone, toolbar
│   ├── providers.tsx          # TanStack Query + Theme providers
│   └── ui/                    # shadcn/ui primitives (button, card, dialog, etc.)
├── lib/
│   ├── __tests__/             # Vitest test files + setup
│   ├── ai/                    # OpenAI, Pinecone, embeddings, RAG pipeline
│   ├── auth/                  # Better Auth config (server + client)
│   ├── cloudinary/            # Cloudinary upload/delete helpers
│   ├── db/                    # Drizzle schema, connection, usage tracking
│   ├── payments/              # Razorpay SDK wrapper + plan definitions
│   ├── api.ts                 # Client-side fetch wrappers
│   ├── env.ts                 # Zod env validation schema
│   ├── logger.ts              # Structured logger
│   └── utils.ts               # cn() helper (clsx + tailwind-merge)
├── proxy.ts                   # Next.js middleware (auth gate + env validation)
├── Dockerfile                 # Multi-stage build (node:22-alpine)
├── drizzle.config.ts          # Drizzle Kit config
├── next.config.ts             # Next.js configuration (standalone, security headers)
├── vitest.config.ts           # Vitest configuration
└── playwright.config.ts       # Playwright E2E configuration
```

---

## API Routes

| Endpoint                        | Method    | Auth     | Description                                           |
| ------------------------------- | --------- | -------- | ----------------------------------------------------- |
| `/api/auth/[...all]`            | GET, POST | —        | Better Auth handler (sign-in, sign-up, session, etc.) |
| `/api/chat`                     | POST      | Required | Stream chat response (RAG + AI)                       |
| `/api/chat/[id]`                | GET       | Required | Get chat with document + all messages                 |
| `/api/chats`                    | GET       | Required | List user's chats with last message                   |
| `/api/chats`                    | POST      | Required | Create or find existing chat for a document           |
| `/api/chats/[id]`               | DELETE    | Required | Delete a chat                                         |
| `/api/chats/[id]`               | PATCH     | Required | Rename a chat                                         |
| `/api/documents`                | GET       | Required | List user's documents                                 |
| `/api/documents/upload`         | POST      | Required | Upload PDF (multipart, max 10MB)                      |
| `/api/documents/[id]`           | DELETE    | Required | Delete document + vector index + storage              |
| `/api/documents/[id]/pdf`       | GET       | Required | Proxy PDF from Cloudinary                             |
| `/api/documents/[id]/reprocess` | POST      | Required | Reprocess errored document                            |
| `/api/usage`                    | GET       | Required | Usage stats & dashboard analytics                     |
| `/api/payments/create-order`    | POST      | Required | Create Razorpay order + customer                      |
| `/api/payments/verify`          | POST      | Required | Verify payment signature                              |
| `/api/payments/webhook`         | POST      | —        | Razorpay webhook (6 event types)                      |
| `/api/payments/subscription`    | GET       | Required | Get active subscription                               |
| `/api/payments/subscription`    | DELETE    | Required | Cancel subscription at period end                     |
| `/api/payments/history`         | GET       | Required | Paginated payment history                             |

---

## Testing

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch
```

Tests use [Vitest](https://vitest.dev/) with `jsdom` environment, [React Testing Library](https://testing-library.com/react/), and the `@/` path alias. Test files live in `lib/__tests__/` and match `**/*.test.{ts,tsx}`.

Current coverage: env validation (6 tests) + chat route handler (4 tests).

### E2E Tests

```bash
# Start the dev server (required)
pnpm dev

# In another terminal
pnpm test:e2e
```

E2E tests use [Playwright](https://playwright.dev/) with Chromium only, single worker, retries once. Test files live in `e2e/`.

> Note: E2E tests are not run in CI (they require a real database and third-party services).

### Pre-push Checks

The pre-push hook enforces:

```bash
pnpm typecheck && pnpm test
```

This blocks pushes with type errors or failing tests.

---

## Deployment

### Docker

```bash
# Build the image
docker build -t docsy:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL=... \
  -e BETTER_AUTH_URL=... \
  -e BETTER_AUTH_SECRET=... \
  -e GOOGLE_CLIENT_ID=... \
  -e GOOGLE_CLIENT_SECRET=... \
  -e OPENAI_API_KEY=... \
  -e PINECONE_API_KEY=... \
  -e PINECONE_INDEX=... \
  -e CLOUDINARY_CLOUD_NAME=... \
  -e CLOUDINARY_API_KEY=... \
  -e CLOUDINARY_API_SECRET=... \
  -e RAZORPAY_KEY_ID=... \
  -e RAZORPAY_KEY_SECRET=... \
  -e RAZORPAY_WEBHOOK_SECRET=... \
  docsy:latest
```

The Dockerfile uses a multi-stage build:

1. **Build stage** — `node:22-alpine`, installs dependencies, builds Next.js
2. **Production stage** — copies only the required artifacts (`.next/standalone/`, `.next/static/`, `public/`), runs as non-root `nextjs` user (uid 1001)

### Production Considerations

- Set `BETTER_AUTH_URL` to your production domain (e.g., `https://docsy.example.com`)
- Configure Razorpay webhook endpoint to `https://docsy.example.com/api/payments/webhook`
- Ensure all 17 environment variables are set
- The app validates env at startup — missing vars will prevent the server from starting
- Rate limiting is handled at the usage/quota level (atomic SQL increments)
- Security headers are configured in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run the verification check: `pnpm typecheck && pnpm test`
5. Commit using [conventional commits](https://www.conventionalcommits.org/) (e.g., `feat(chat): add streaming progress indicator`)
6. Push and open a Pull Request against `main`

### CI Pipeline

Every PR to `main` triggers:

- `pnpm typecheck` — TypeScript strict mode
- `pnpm lint` — ESLint flat config
- `pnpm test` — Vitest unit tests

### Pre-commit Hooks

[Husky](https://typicode.github.io/husky/) runs [lint-staged](https://github.com/lint-staged/lint-staged) before every commit:

- `*.{ts,tsx,mjs}` — ESLint fix + Prettier format
- `*.{json,md,css}` — Prettier format

---

## License

MIT. See [LICENSE](./LICENSE) for details.

> **Note:** This repository does not currently include a LICENSE file. The project author should add one before public distribution.
