# /investigate — Understand before implementing

## Purpose
Read and map the codebase relevant to a task. Produce a scoped implementation plan.
**No code is written until the user approves the plan.**

This command is a hard gate. Investigation first, implementation second — always.

---

## Step 1 — Clarify the task

Before opening any file, restate the task in your own words:

```
Task: <your understanding of what needs to be done>
Assumed entry point: <file, route, component, or module you'll start from>
```

If the task is ambiguous in any of these ways → **stop and ask, do not assume:**
- Multiple files could be the entry point
- The scope is unclear (one function? one module? full feature?)
- The task conflicts with something that may already exist
- You don't know which branch or environment this applies to

One question at a time. Don't ask three things at once.

---

## Step 2 — Map the territory

Trace the relevant code. Use search and read — never guess from filenames alone.

### Find the entry point
```bash
# Search by keyword, function name, route, or component
grep -r "keyword" --include="*.ts" --include="*.tsx" -l
grep -rn "functionName\|RouteName" src/
```

### Trace the call chain
Follow imports, exports, and dependencies outward from the entry point.
Go at least 2–3 levels deep or until you hit a boundary (DB call, external API, UI leaf).

### Check for existing implementations
```bash
# Does something like this already exist?
grep -rn "similarFunction\|relatedTerm" src/
```

### Read the actual files
Do not summarize from grep output alone. Open and read:
- The primary file(s) that will change
- The types/interfaces involved
- Any shared utilities being used
- Tests if they exist

### Check the data layer
If the task touches data:
```bash
# Schema files
find . -name "*.schema.ts" -o -name "schema.ts" -o -name "*.model.ts"
# Migration files
find . -path "*/migrations/*" -name "*.ts" | sort | tail -5
```

---

## Step 3 — Identify all impact zones

For every file you read, classify it:

| Zone | Meaning |
|------|---------|
| **Must change** | Directly implements the task |
| **Likely change** | Type updates, imports, re-exports |
| **Risk zone** | Adjacent code that could break |
| **Read-only** | Needed for context, not changing |
| **Out of scope** | Related but explicitly not touching |

List every file with its zone. Be exhaustive — missing a file here causes mid-implementation surprises.

---

## Step 4 — Surface blockers and unknowns

Before planning, answer these:

- Is there a **schema migration** required before this code can work?
- Are there **environment variables** that need to exist?
- Does this task **depend on another PR or branch** that isn't merged yet?
- Are there **existing tests** that will break with this change?
- Is there **shared state** (cache, store, singleton) that this touches?
- Does this change affect **multiple consumers** (other modules, services, APIs)?

If any blocker exists → **report it immediately**. Do not plan around a blocker silently.

```
⚠️ Blocker: <description>
This must be resolved before implementation can begin.
Options: <option A> / <option B>
```

---

## Step 5 — Write the implementation plan

Only after Steps 2–4 are complete. Structure it exactly like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVESTIGATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task (restated):
<precise description of what will be built>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT I FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Bullet summary of relevant existing code. Be specific.
 File names, line numbers, function names. No vague summaries.>

- src/auth/middleware.ts — token validation lives here (lines 34–67)
- src/types/user.ts — User interface, currently missing `role` field
- src/routes/api.ts — 3 routes bypass the guard (lines 12, 45, 89)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES THAT WILL CHANGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Must change:
- src/types/user.ts — add `role` field to User interface
- src/auth/middleware.ts — update guard logic to check role
- src/routes/api.ts — apply guard to 3 unprotected routes

Likely change:
- src/auth/auth.service.ts — include role when building JWT payload

Risk zone (not changing, but watch):
- src/auth/session.ts — shares User type, check for breakage after types update

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT I AM NOT TOUCHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Everything explicitly out of scope. Naming these prevents scope creep.>

- Password reset flow — unrelated
- Session refresh logic — separate concern, not broken
- Unrelated route handlers in routes/api.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [src/types/user.ts] Add `role: UserRole` to User interface
   → verify: TypeScript compiles with no new errors

2. [src/auth/middleware.ts] Update RolesGuard to read role from JWT payload
   → verify: existing tests still pass

3. [src/routes/api.ts] Apply guard to lines 12, 45, 89
   → verify: protected routes return 403 for unauthorized requests

4. [src/auth/auth.service.ts] Include role in JWT payload at token issue time
   → verify: decoded token contains role field

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISKS & UNKNOWNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Honest list. If there are none, say so explicitly.>

- role field doesn't exist in DB yet — migration may be needed
- Existing JWTs won't have role field until re-issued — logout-all may be required
- No tests currently cover the guard — changes are unverified without adding them

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<List blockers or write NONE>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WAITING FOR APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Does this plan look correct?
Reply with:
  ✅ go ahead     — start implementation in order
  ✏️  adjust       — correct scope, steps, or assumptions
  ❌ stop          — task has changed or blockers need resolving first
```

---

## Step 6 — After approval

Once the user confirms with "go ahead" or equivalent:

- Implement **one step at a time** in the order listed
- After each step, state what was done and what the verify check result was
- Do not skip ahead or batch steps silently
- If a new unknown appears mid-implementation → pause, report it, ask before continuing

**Never start Step 6 without explicit approval from Step 5.**
