# Hydration Fix — next-themes color-scheme mismatch

## Goal

Fix React hydration error caused by `next-themes` injecting `style={{color-scheme:"dark"}}` on `<html>` client-side when server-rendered HTML lacks that attribute.

## Root Cause

- `components/providers.tsx` uses `ThemeProvider` with `defaultTheme="system"` and `enableSystem`.
- On client mount, `next-themes` reads `prefers-color-scheme` OS preference and applies `style="color-scheme:dark|light"` to `<html>`.
- Server renders `<html>` without this style (server has no OS preference access).
- React hydration detects the extra attribute and throws a hydration mismatch error.

## Fix

- **File:** `app/layout.tsx:29`
- **Change:** Add `suppressHydrationWarning` prop to `<html>` element.
- **Rationale:** This is the documented recommendation for `next-themes`. It tells React to accept attribute differences on this element between server and client — the `color-scheme` style will be correctly applied after hydration.

## Verification

- Run `pnpm dev` — no hydration error in console on initial page load.
- Run `pnpm typecheck` — passes.
- Run `pnpm test` — all tests pass (no behavioral change).
