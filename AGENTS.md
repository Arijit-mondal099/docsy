# AGENTS.md

## Repo purpose

OpenCode configuration + design reference for "chat-with-pdf" project. No application source code lives here — this repo sets up OpenCode with agents, commands, and skills for work that happens elsewhere.

## What's here

| Path | Purpose |
|------|---------|
| `opencode.json` | OpenCode config — instructions, agents, commands |
| `.opencode/agents/*.md` | Agent definitions (dev, debugger, git, reviewer, db, ai-engineer) |
| `.opencode/commands/*.md` | `/investigate`, `/review`, `/commit`, `/pr` workflows |
| `CLAUDE.md` | Behavioral guidelines (think first, simple code, surgical edits) |
| `DESIGN.md` | Anthropic/Claude design system reference (verbose — only for UI work) |
| `.opencode/skills/` | Installed skills: `frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices`, `web-design-guidelines`, `webapp-testing`, `test-driven-development` |

## Working in this repo

- **Read `.opencode/agents/dev.md` first** — defines the assumed stack (Next.js 15 App Router, Tailwind v4, shadcn/ui new-york, Framer Motion, Node/Express/NestJS, BullMQ, SSE, PostgreSQL/MongoDB/Redis, JWT auth, pnpm, TS strict, Zod, RHF, TanStack Query, Zustand) and core implementation rules.
- **`opencode.json` `"instructions"` includes this file.** Agent/command changes belong in `.opencode/agents/` and `.opencode/commands/`, not here.
- **Skills installed:** `frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices`, `web-design-guidelines`, `webapp-testing`, `test-driven-development`. Load relevant ones with the skill tool.
- **No build, test, lint, or CI config exists.** If this repo gains source code, add those as they appear.
- **`DESIGN.md`** is a verbose reference — consult only when doing UI work targeting Anthropic/Claude's visual system.

## Plan storage

All plans saved to `.opencode/plans/<feature-name>.md`. In Plan mode, persist the plan document before ending session.

## Agent delegation (from dev.md)

| Task | Delegate to |
|------|-------------|
| Code review | `@reviewer` |
| Bug tracing | `@debugger` |
| Git/commit/PR | `@git` |
| Schema design, query optimization | `@db` |
| RAG pipelines, embeddings, LLM integrations | `@ai-engineer` |

## Core implementation rules (from dev.md)

**Before writing code:**
- Read relevant files first. Never assume structure from filenames.
- Restate understanding before starting.
- If ambiguous — ask one question. Don't guess silently.

**While implementing:**
- Minimum code that solves the problem. No speculative abstractions.
- Match existing code style exactly — naming, formatting, patterns.
- Touch only what the task requires. No refactoring adjacent code.
- Remove imports/variables YOUR changes make unused. Leave pre-existing dead code alone.
- No `any` to bypass type errors. No `as X` casts that could lie.

**After implementing:**
- Verify changes compile and verify check passes before reporting done.
- State what changed, what files touched, what was explicitly left alone.

## Commit style

Conventional commits: `type(scope): description`
Types: feat, fix, refactor, chore, style, test, docs, perf
One concern per commit. Never batch unrelated changes.