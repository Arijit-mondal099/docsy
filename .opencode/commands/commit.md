# /commit — Stage, validate, and commit changes

## Purpose
Create a clean, conventional commit for staged or unstaged changes. Validates scope before committing.

---

## Step 1 — Audit the diff

Run:
```
git diff
git diff --staged
git status
```

Before proceeding, answer these internally:
- Do ALL changed lines trace directly to the task at hand?
- Are there any unrelated edits (formatting, adjacent refactors, dead code)?
- Any leftover `console.log`, `TODO`, or debug artifacts?
- Any imports/variables that MY changes made orphaned?

If unrelated changes exist → **stop and report them**. Do not include them in this commit.
Ask: "I found unrelated changes in [file]. Should I stash them or include them?"

---

## Step 2 — Validate before staging

Check:
- [ ] No secrets, tokens, or `.env` values in the diff
- [ ] No `console.log` / `debugger` / `console.error` left in production paths
- [ ] No commented-out code blocks added by this session
- [ ] Imports are clean — no unused ones introduced by these changes
- [ ] Types are correct — no `any` added to bypass a type error

If any check fails → **fix it first**, then return to Step 1.

---

## Step 3 — Determine commit type and scope

Use **Conventional Commits** format: `type(scope): description`

| Type | When to use |
|------|-------------|
| `feat` | New feature or behavior |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `chore` | Tooling, deps, config |
| `style` | Formatting only |
| `test` | Tests only |
| `docs` | Documentation only |
| `perf` | Performance improvement |

**Scope** = the module, page, or domain affected. Examples:
- `feat(auth): add refresh token rotation`
- `fix(dashboard): correct column order mismatch`
- `chore(deps): upgrade to pnpm 9`

**Description rules:**
- Lowercase, imperative mood ("add", not "added" or "adds")
- No period at the end
- Max 72 characters total for the subject line
- Be specific — avoid vague verbs like "update", "fix stuff", "changes"

---

## Step 4 — Stage and commit

```bash
git add -p   # or git add <specific files>
git commit -m "type(scope): description"
```

For commits with meaningful context, use a body:
```bash
git commit -m "type(scope): description

- Why this change was needed
- What approach was taken (if non-obvious)
- Any side effects or follow-ups needed"
```

---

## Step 5 — Verify

```bash
git log --oneline -3
git show --stat HEAD
```

Confirm:
- Commit message is clean and precise
- Only intended files are in the commit
- No accidental large files or binary blobs

---

## Output to user

Report back:
```
✅ Committed: <full commit hash> — "<commit message>"
Files changed: X | Insertions: +Y | Deletions: -Z
```

If you skipped or flagged anything, state it explicitly.
