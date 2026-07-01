# Fix: ChatSidebar active conversation colors

## Problem
When a user clicks a conversation in ChatSidebar and lands on `/chat/[id]`, the selected item uses `bg-accent text-accent-foreground` — a solid saturated blue background with white text. This is:
- Too visually heavy compared to the surrounding UI
- Inconsistent with the dashboard sidebar's active pattern (`bg-primary/10 text-primary font-semibold`)
- Doesn't look polished as a nav-selection state

## Root cause
Two different active-state patterns exist in the app. The dashboard sidebar uses a subtle 10%-opacity primary tint (shadcn modern pattern), while ChatSidebar uses a full solid accent background (button-like, not nav-like).

## Solution
Align ChatSidebar's active styling with the dashboard sidebar pattern:
- `bg-primary/10 text-primary font-semibold` instead of `bg-accent text-accent-foreground`
- Add `data-active` attribute for consistency

## Files changed
- **EDIT** `components/chat/chat-sidebar.tsx` — update the `<Link>` className (lines 154–159) and add `data-active` attribute

## Verification
- Navigate to a chat → selected conversation shows subtle primary tint, not heavy accent
- `pnpm typecheck` and `pnpm test` pass
