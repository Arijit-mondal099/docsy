# Redesign chat input to Claude.ai style

## Problem
Current chat input is functional but has a boxed-in look (`border-t p-4` wrapper, shadcn Button component for send). Doesn't match the clean, modern feel of Claude.ai's input.

## Solution
Redesign the ChatInput component and its placement in ChatPanel to match Claude.ai's input:
- Paperclip attach button on the left
- Clean container with subtle border/focus ring
- Native button for send (tighter control, colored when text exists, gray when empty)
- Centered layout with max-width in the chat panel
- Remove the boxed footer feel

## Files changed
- **EDIT** `components/chat/chat-input.tsx` — full visual redesign
- **EDIT** `components/chat/chat-panel.tsx` — update input wrapper styles

## Verification
- Input shows Paperclip icon left, send button right, centered layout
- Auto-resize still works, Enter sends, Shift+Enter newline
- `pnpm typecheck` and `pnpm test` pass
