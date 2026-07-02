# Fix documents page overflow + upgrade badge for pro users

## Task

1. Fix vertical overflow on dashboard pages — scroll only within main content panel, not body/html
2. Hide "Upgrade to Pro" badge for users who already have a Pro plan

## Root causes

### Overflow

Classic flexbox `min-height: auto` gotcha — main panel has `overflow-y-auto` but can't shrink below content height. Outer wrapper lacks `overflow-hidden`, so overflow propagates to body level.

### Upgrade badge visible for Pro users

Better Auth doesn't include custom `plan` field in session by default, so `userPlan` from `layout.tsx` line 20 always falls back to `'free'`. Sidebar's `isFree` check never returns `false` for Pro users.

## Files changed

### Must change

- `app/(dashboard)/layout.tsx` — add `overflow-hidden` to outer div, `min-h-0` to main panel
- `components/dashboard/sidebar.tsx` — use `usageStats.plan` instead of session `userPlan` for `isFree` check

## Implementation steps

1. `app/(dashboard)/layout.tsx`: Add `overflow-hidden` to outer wrapper, `min-h-0` to main panel
2. `components/dashboard/sidebar.tsx`: Change `isFree` to use `usageStats.plan`
3. `pnpm typecheck && pnpm test`
