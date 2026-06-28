# /review — Pre-commit code review gate

## Purpose
Act as a senior engineer reviewing your own diff before it gets committed or pushed.
This is a **blocking gate** — surface every issue, then let the user decide how to proceed.

---

## Step 1 — Gather context

```bash
git diff HEAD
git diff --staged
git status --short
```

Also read the relevant source files in full if the diff touches logic that requires context to evaluate.

---

## Step 2 — Run the review checklist

Go through every changed file. For each, check:

### Correctness
- [ ] Does the logic match the stated intent?
- [ ] Are edge cases handled? (null, undefined, empty array, 0, negative numbers)
- [ ] Are async flows correct? (missing await, unhandled promise rejection, race conditions)
- [ ] Are conditionals correct? (`===` not `==`, correct boolean logic)
- [ ] Do mutations happen where they shouldn't? (unintended side effects)

### Code quality
- [ ] Is there duplication that should be a shared function?
- [ ] Are variable/function names clear and honest about what they do?
- [ ] Is any logic harder to read than it needs to be?
- [ ] Are magic numbers/strings named as constants?
- [ ] Is the abstraction level consistent within a function?

### TypeScript / types
- [ ] No `any` used to bypass a type error
- [ ] No `as X` casts that could silently lie
- [ ] Return types are explicit on exported functions
- [ ] Interfaces/types reflect actual data shape

### Security
- [ ] No secrets, API keys, or tokens in the diff
- [ ] No user-controlled input used unescaped in queries or commands
- [ ] No new `dangerouslySetInnerHTML` without justification

### Hygiene
- [ ] No `console.log`, `debugger`, or debug artifacts
- [ ] No commented-out code added in this session
- [ ] No unused imports introduced by these changes
- [ ] No stray `TODO` without a tracking issue reference

### Scope discipline
- [ ] Every changed line traces directly to the stated task
- [ ] No unrelated refactors, formatting fixes, or "while I was here" edits mixed in
- [ ] If unrelated changes exist → flag them for a separate commit

---

## Step 3 — Categorize findings

Group issues by severity:

**🔴 Must fix before commit**
- Bugs, broken logic, security issues, type lies

**🟡 Should fix (small effort)**
- Dead code, vague names, missing edge cases

**🔵 Consider (low priority)**
- Style preferences, minor readability, future improvements

---

## Step 4 — Output format

```
## Review: <branch or description>

### 🔴 Blockers (X)
- [file:line] Description of issue

### 🟡 Should fix (X)
- [file:line] Description

### 🔵 Notes (X)
- [file:line] Suggestion

### ✅ Looks good
- [What's working well]

### Recommendation
APPROVE / FIX FIRST / DISCUSS
```

If there are zero issues, say so explicitly with `✅ Clean diff — no issues found.`

---

## Step 5 — After fixes

If the user fixes blockers, re-run the review on the updated diff before approving.
Do not re-flag issues that were already fixed.
