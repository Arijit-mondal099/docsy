# Global Scrollbar Style

## Task

Add a custom global scrollbar style across the entire app. Thin, rounded, themed to match the brand (light + dark mode).

## Investigation

- `app/globals.css` — all global styles live here. Tailwind v4 + shadcn/ui with CSS variables for theming. No existing scrollbar styling.
- `app/(dashboard)/layout.tsx:62` — main content panel uses `overflow-y-auto` — key scrollable surface.
- Theme colors available: `--brand`, `--border`, `--muted`, `--background`, `--foreground`.
- No scrollbar plugins installed — will use pure CSS.
- Tailwind v4 has no built-in scrollbar utilities.

## Files that will change

**Must change:**

- `app/globals.css` — add scrollbar styles to the `@layer base` block

**Risk zone (not changing, but watch):**

- `app/(dashboard)/layout.tsx` — the `overflow-y-auto` surface should benefit automatically; no change needed

## Implementation steps

1. [app/globals.css] Add scrollbar styles inside `@layer base`
   - WebKit: `::-webkit-scrollbar` width 6px, track uses `--muted`, thumb uses `--border` / `--brand` on hover
   - Firefox: `scrollbar-width: thin; scrollbar-color: var(--border) transparent;`
   - Both light and dark mode will work automatically since we reference CSS variables
   - Verify: typecheck passes

## Risks & unknowns

None — cosmetic CSS-only addition.

## Blockers

NONE
