# /pr — Create a pull request with a complete, honest description

## Purpose
Generate a production-quality PR that gives the reviewer everything they need — context, scope, testing notes, and risks — without padding or vague summaries.

---

## Step 1 — Gather everything needed

Run:
```bash
git log main..HEAD --oneline           # or replace main with your base branch
git diff main..HEAD --stat
git diff main..HEAD
git status
```

Also read:
- Any relevant issue/ticket mentioned in the branch name or commits
- Related files touched to understand the feature domain

---

## Step 2 — Validate pre-PR checklist

- [ ] All commits on this branch follow conventional commit format
- [ ] No debug artifacts (`console.log`, `debugger`) in the diff
- [ ] No secrets or env values committed
- [ ] Branch is up to date with base branch (rebase if needed)
- [ ] No merge conflicts
- [ ] Build passes locally (if applicable)
- [ ] If there's a linter/formatter — it passes

If any check fails → stop and fix before generating the PR body.

---

## Step 3 — Generate the PR body

Use this exact template. Fill every section — never leave one blank or write "N/A":

```markdown
## Summary
<!-- 2–4 sentences. What does this PR do and why does it exist?
     Write for someone who has zero context on this task.
     What problem does it solve? What was wrong before? -->


## Changes
<!-- Bulleted list of what actually changed. Be specific.
     "Updated X to do Y" not "fixed stuff" or "various improvements"
     Group by file or concern if the diff is large. -->

- 
- 
- 

## How to test
<!-- Step-by-step. Assume the reviewer has the repo running locally.
     Include: env vars needed, seed data, specific routes/pages to visit,
     API endpoints to call, and what the expected result looks like. -->

1. 
2. 
3. 

Expected result: 

## Screenshots / recordings
<!-- If this touches UI: add before/after screenshots or a Loom.
     If API only: paste a curl or Postman request + response sample.
     If infrastructure: show logs or metrics before/after. -->


## Risk & side effects
<!-- What could this break? What are the edge cases you're NOT handling?
     What assumptions does this code make that could be wrong?
     If low risk, say so explicitly and why. -->


## Follow-ups (if any)
<!-- Anything deliberately deferred. Link issues if they exist. -->

```

---

## Step 4 — Set PR metadata

**Title:** `type(scope): clear description of what changed`
- Conventional commit format, imperative mood, lowercase
- Max 72 characters

**Base branch:** detect by running:
```bash
git remote show origin | grep "HEAD branch"
```
If ambiguous, ask the user. Do not guess.

**Labels (suggest):** `feat` / `fix` / `chore` / `breaking` / `needs-review`

**Reviewers:** Ask the user if not specified. Do not guess.

---

## Step 5 — Build the GitHub PR URL

`gh` CLI is not available. Build the PR creation URL manually.

Run:
```bash
git remote get-url origin          # get the repo URL
git rev-parse --abbrev-ref HEAD    # get current branch name
```

Strip `.git` from the remote URL if present, then construct:

```
https://github.com/<owner>/<repo>/compare/<base>...<current-branch>?expand=1
```

Example:
- Remote: `https://github.com/arijit/vireon.git`
- Base: `main`
- Branch: `feat/phase-2-auth`
- URL: `https://github.com/arijit/vireon/compare/main...feat/phase-2-auth?expand=1`

The `?expand=1` opens the PR form pre-filled with the branch. The user pastes the title and body manually.

---

## Step 6 — Final output

Print everything in this exact order:

```
─────────────────────────────────────
PR TITLE
─────────────────────────────────────
<title here>

─────────────────────────────────────
BASE BRANCH → CURRENT BRANCH
─────────────────────────────────────
<base> → <current-branch>

─────────────────────────────────────
PR BODY (copy this into GitHub)
─────────────────────────────────────
<full PR body>

─────────────────────────────────────
OPEN THIS URL TO CREATE THE PR
─────────────────────────────────────
<github compare URL>
```

Do NOT add AI generation footers, marketing language, or sign-offs.
Do NOT use filler phrases like "This PR aims to..." or "This change was made in order to..."
Write like a senior engineer who respects the reviewer's time.
