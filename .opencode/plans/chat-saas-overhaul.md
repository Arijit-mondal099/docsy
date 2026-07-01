# Chat SaaS Overhaul — Phase 1-3 Plan

## Scope

Rebuild the chat-with-pdf section as a production-grade SaaS experience:

- **Phase 1:** Design system (blue/slate palette, Plus Jakarta Sans)
- **Phase 2:** Conversation management (sidebar, rename, delete, list)
- **Phase 3:** Chat UI polish + PDF viewer upgrade

## Branch

`feat/chat-saas-overhaul`

## Atomic commits (18 total)

### Phase 1 — Design System

1. `feat(design): add Plus Jakarta Sans to layout` — swap Geist → Plus Jakarta Sans + JetBrains Mono
2. `feat(design): update globals.css with blue/slate design tokens` — #1E293B primary, #2563EB accent, slate-50 bg
3. `feat(dashboard): add Chats nav link to sidebar` — new nav item between Dashboard and Documents

### Phase 2 — Conversation Management

4. `feat(db): add name column to chats table` — migration + schema change
5. `feat(api): add GET /api/chats to list conversations` — list user's chats with latest message
6. `feat(api): add PATCH+DELETE /api/chats/[id]` — rename/delete endpoints
7. `feat(api): auto-name chat from first user message` — set chat name on first message
8. `feat(chat): build conversation sidebar component` — scrollable chat list with rename/delete
9. `feat(chat): integrate sidebar into chat page layout` — 3-panel layout
10. `feat(api): add fetchChats/renameChat/deleteChat client API` — typed wrappers

### Phase 3 — Chat UI Polish + PDF Viewer

11. `feat(chat): add react-markdown and code highlighting` — dependencies + renderer
12. `feat(chat): rebuild message-bubble with feedback+citations` — thumbs, sources, avatars
13. `feat(chat): add model selector dropdown` — GPT-4o / Gemini toggle
14. `feat(chat): add suggested questions chips` — quick action prompts
15. `feat(chat): enhance chat-input with Shift+Enter` — newline support, better UX
16. `feat(chat): rebuild chat-panel with new layout and features` — integrate all components
17. `feat(pdf): add enhanced PDF viewer with toolbar` — page nav, zoom, controls
18. `feat(api): support model preference + return citations` — backend changes

## Files that change

### Must change (by phase)

**Phase 1:**

- `app/layout.tsx` — font imports
- `app/globals.css` — all theme variables
- `components/dashboard/sidebar.tsx` — Chats nav item

**Phase 2:**

- `lib/db/schema/index.ts` — add `name` column to chats
- `app/api/chats/route.ts` — add GET handler
- `app/api/chats/[id]/route.ts` — NEW: PATCH + DELETE
- `app/api/chat/route.ts` — auto-name on first message
- `components/chat/chat-sidebar.tsx` — NEW
- `app/(dashboard)/chat/[id]/page.tsx` — integrate sidebar
- `lib/api.ts` — add chat CRUD wrappers

**Phase 3:**

- `package.json` — react-markdown, rehype-highlight, remark-gfm
- `components/chat/chat-panel.tsx` — major rewrite
- `components/chat/message-bubble.tsx` — rewrite
- `components/chat/chat-input.tsx` — enhance
- `components/chat/model-selector.tsx` — NEW
- `components/chat/suggested-questions.tsx` — NEW
- `components/pdf/pdf-viewer.tsx` — NEW
- `components/pdf/pdf-toolbar.tsx` — NEW
- `app/api/chat/route.ts` — model preference + citations
- `lib/ai/rag.ts` — citation metadata

### Risk zone

- Current brand color consumers (`--brand` in scrollbar hover, marketing pages)
- Existing chat records without names (graceful: fallback to "Chat" label)
- Mobile layout for 3-panel chat page

## New dependencies (Phase 3)

- `react-markdown` — markdown rendering
- `rehype-highlight` — code syntax highlighting
- `remark-gfm` — GitHub-flavored markdown
- `pdfjs-dist` — enhanced PDF viewer (optional, iframe fallback)

## Design tokens

### Light mode

```
--background: #F8FAFC    --foreground: #0F172A
--card: #FFFFFF           --card-foreground: #0F172A
--primary: #1E293B        --primary-foreground: #FFFFFF
--secondary: #F1F5F9      --secondary-foreground: #1E293B
--muted: #F1F2F3          --muted-foreground: #64748B
--accent: #2563EB         --accent-foreground: #FFFFFF
--brand: #2563EB          --destructive: #DC2626
--border: #E2E8F0         --input: #E2E8F0
--ring: #2563EB
```

### Dark mode

```
--background: #0F172A     --foreground: #F8FAFC
--card: #1E293B           --card-foreground: #F8FAFC
--primary: #F8FAFC        --primary-foreground: #1E293B
--secondary: #334155      --secondary-foreground: #F8FAFC
--muted: #1E293B          --muted-foreground: #94A3B8
--accent: #3B82F6         --accent-foreground: #FFFFFF
--brand: #3B82F6          --destructive: #EF4444
--border: #334155         --input: #334155
--ring: #3B82F6
```

## Typography

- Display/body: Plus Jakarta Sans (300-700 weight)
- Mono/code: JetBrains Mono
