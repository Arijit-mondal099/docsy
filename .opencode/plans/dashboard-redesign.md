# Dashboard Redesign — Professional SaaS UI with Floating Panels & Charts

## Goal

Replace the current monolithic dashboard layout with a **floating two-panel layout** (rounded sidebar + rounded content area with visible gap), and redesign the `/dashboard` page into a professional SaaS analytics hub with live stat cards, charts/graphs, and rich data display.

---

## What I Found

### Current Layout (`app/(dashboard)/layout.tsx`)

- **Monolithic design:** Sidebar and content touch — no gap, no rounded outer containers. Sidebar uses `border-r` and `bg-muted/30`.
- **Mobile:** Hamburger Sheet with sidebar inside. Desktop: `<aside>` with `w-64 shrink-0 border-r bg-muted/30`.
- **Content area:** `<main className="flex-1 p-6">` — straight edges, no rounding.

### Current Dashboard Page (`app/(dashboard)/dashboard/page.tsx`)

- Server component with hardcoded "0 / 5" and "0 / 50" stats — **not live data**.
- 3 basic cards: Upload a PDF (dashed border), Recent Documents (empty), Quick Stats (hardcoded).
- No charts, no graphs, no activity feed.

### Current Sidebar (`components/dashboard/sidebar.tsx`)

- Hand-rolled component. Inline SVG icons (not Lucide). Usage stats fetched from `/api/usage` via TanStack Query (30s refetch).
- Two nav items (Dashboard, Documents). Bottom: user avatar (initial circle), name, email, sign-out button.

### Available Data

- **`/api/usage`** — returns `{ documentsUploaded, messagesSent, resetDate, documentLimit, messageLimit }`.
- **Documents table** — `id`, `userId`, `name`, `cloudinaryUrl`, `status`, `pageCount`, `createdAt`.
- **Chats table** — `id`, `documentId`, `userId`, `createdAt`.
- **Messages table** — `id`, `chatId`, `role`, `content`, `createdAt`.
- No historical/aggregation queries exist. No per-model or token tracking.

### Current Tech Stack

- **Tailwind v4** (CSS-first, no config file). Radius base: `0.625rem`. Built-in chart CSS vars (unused).
- **shadcn/ui** `base-nova` style with `@base-ui/react` (not Radix). 11 components installed.
- **Lucide icons** (in `package.json`) — not yet used in dashboard.
- **Recharts** — NOT installed. No chart component exists.
- **Geist Sans** font (body + heading). Blue brand color (`oklch(0.55 0.18 260)`).

### DESIGN.md Reference

Anthropic/Claude-inspired cream + coral spec exists but is aspirational — not currently applied. The current palette is neutral oklch with blue brand.

---

## Files That Will Change

### Must change

| File                                 | What changes                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `app/(dashboard)/layout.tsx`         | Full layout rewrite — floating panels with gap, new sidebar integration, redesigned mobile header |
| `app/(dashboard)/dashboard/page.tsx` | Complete rewrite — stat cards, charts, activity, quick actions                                    |
| `components/dashboard/sidebar.tsx`   | Full redesign — Lucide icons, new nav items, polished usage display, floating panel style         |
| `app/api/usage/route.ts`             | Enrich return value with additional aggregates (chat count, document breakdown by status)         |

### Likely change

| File              | What changes                                   |
| ----------------- | ---------------------------------------------- |
| `lib/api.ts`      | Add new types for dashboard analytics response |
| `lib/db/usage.ts` | May extend with aggregation queries            |
| `package.json`    | Add `recharts` dependency                      |

### New files

| File                                        | Purpose                                            |
| ------------------------------------------- | -------------------------------------------------- |
| `components/dashboard/stat-card.tsx`        | Reusable KPI stat card (icon, label, value, trend) |
| `components/dashboard/chart-card.tsx`       | Card wrapper for chart with title + description    |
| `components/dashboard/dashboard-charts.tsx` | Charts section (donut + bar chart) using recharts  |
| `components/dashboard/recent-activity.tsx`  | Recent documents/chats list                        |
| `components/dashboard/quick-actions.tsx`    | Quick action buttons row                           |

### Read-only (context, no changes)

- `app/(dashboard)/documents/page.tsx` — stays as-is (documents list page)
- `app/(dashboard)/chat/[id]/page.tsx` — stays as-is
- `app/globals.css` — chart CSS vars already defined, no changes needed
- `lib/db/schema/index.ts` — schema is sufficient as-is
- `app/(dashboard)/loading.tsx` — may need minor polish but no structural change
- `app/(dashboard)/error.tsx` — stays as-is

### Out of scope

- Documents list page redesign — separate task
- Chat page redesign — separate task
- Billing/subscription system
- User settings page
- Dark mode toggle behavior (already works)
- Changing root layout, providers, or middleware

---

## Implementation Steps

### Step 1 — Install dependencies

```bash
pnpm add recharts
npx shadcn@latest add chart -y
```

Also add any additional shadcn components needed: `progress`, `tabs` (optional).

**Verify:** `pnpm typecheck` passes. Recharts appears in `package.json`. `components/ui/chart.tsx` exists.

### Step 2 — Enrich `/api/usage` with dashboard analytics

**File:** `app/api/usage/route.ts`

Extend the GET response to include:

- `totalDocuments` — `COUNT(*) FROM documents`
- `readyDocuments` — `COUNT(*) WHERE status = 'ready'`
- `errorDocuments` — `COUNT(*) WHERE status = 'error'`
- `totalChats` — `COUNT(*) FROM chats`
- `totalMessages` — `COUNT(*) FROM messages` (join through chats)
- `recentDocuments` — last 5 documents
- `usagePercentage` — `documentsUploaded / documentLimit` and `messagesSent / messageLimit`

This avoids creating a separate `/api/analytics` endpoint. The `UsageStats` type in `lib/api.ts` gets extended with these new fields.

**Verify:** Visit `/api/usage` in browser (authenticated) — returns enriched object.

### Step 3 — Redesign dashboard layout (floating panels)

**File:** `app/(dashboard)/layout.tsx`

Replace the monolithic layout with:

```html
<body class="min-h-screen bg-muted/30">
  <div class="flex gap-4 p-4 min-h-screen">
    <!-- Sidebar - floating rounded panel -->
    <aside class="hidden w-64 shrink-0 md:block">
      <div class="sticky top-4 rounded-xl border bg-card shadow-sm">
        <Sidebar ... />
      </div>
    </aside>

    <!-- Main content - floating rounded panel -->
    <main class="flex-1 rounded-xl border bg-card shadow-sm">
      <div class="p-6">{children}</div>
    </main>
  </div>

  <!-- Mobile header (unchanged pattern, updated styling) -->
  ...
</body>
```

Key design decisions:

- **Outer container:** `flex gap-4 p-4 min-h-screen` on a `bg-muted/30` body.
- **Sidebar:** `w-64 shrink-0`, `rounded-xl`, `border bg-card shadow-sm`, `sticky top-4`.
- **Content:** `flex-1`, `rounded-xl`, `border bg-card shadow-sm`, inner `p-6`.
- **Gap:** `gap-4` between panels. `p-4` from viewport edges.
- Mobile: hamburger + Sheet (same pattern, updated to match new style).

**Verify:** Dashboard renders with visible gap between floating panels. Both have rounded corners and shadow.

### Step 4 — Redesign sidebar

**File:** `components/dashboard/sidebar.tsx`

Changes:

- Replace inline SVGs with Lucide icons (`LayoutDashboard`, `FileText`, `Settings`, `LogOut`)
- Add nav items: Dashboard, Documents, (future: Settings)
- Redesign usage badge as a compact progress bar
- Polish user section with Lucide icons
- Remove `isSheet` prop (mobile Sheet already handles styling)

Style: Clean, compact, with active nav state using brand color.

### Step 5 — Redesign dashboard main page

**File:** `app/(dashboard)/dashboard/page.tsx`

Convert from server component to client component (or make it a thin server wrapper that passes session data to a client component) so we can use TanStack Query for live data.

Layout:

```
┌──────────────────────────────────────────┐
│  Good morning, {name}                    │
│  Here's your usage overview              │
├──────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Docs  │ │ Msgs  │ │Chats │ │Usage │   │
│  │ 3/5   │ │ 12/50 │ │  8   │ │ 27%  │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
├──────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ Usage Donut  │  │ Activity / Bar   │  │
│  │ Chart        │  │ Chart            │  │
│  │ (docs/msgs)  │  │ (messages by day)│  │
│  └──────────────┘  └──────────────────┘  │
├──────────────────────────────────────────┤
│  Recent Documents / Quick Actions        │
└──────────────────────────────────────────┘
```

Components to create:

- **`stat-card.tsx`** — Reusable KPI card with icon, label, value, optional secondary value, variant for color.
- **`dashboard-charts.tsx`** — Contains donut chart (documents vs messages usage) + bar chart (recent activity).
- **`recent-activity.tsx`** — Lists last 5 documents with status badges.
- **`quick-actions.tsx`** — Row of buttons: Upload PDF, New Chat, View Documents.

**Verify:** Dashboard shows live stats, charts render with actual data, responsive layout works.

### Step 6 — Polish & responsive

- Mobile: sidebar collapses to Sheet (work with `lg:` breakpoint instead of `md:` if needed)
- Charts stack vertically on small screens
- Stat cards go 2-up on tablet, 1-up on mobile
- Test: `pnpm lint`, `pnpm typecheck`, `vitest run`

### Step 7 — Create branch and PR

```bash
git checkout -b feat/dashboard-redesign
git add .
git commit -m "feat(dashboard): redesign with floating panels, charts, and live stats"
git push origin feat/dashboard-redesign
# Create PR via GitHub UI (gh CLI not functional)
```

---

## Risks & Unknowns

- **recharts chart colors:** Need to wire into existing `--chart-1` through `--chart-5` CSS vars for dark/light mode compatibility. The shadcn chart component handles this.
- **Sticky sidebar behavior:** The sidebar uses `sticky top-4` inside the flex layout. Need to test that the full sidebar content fits without overflow on smaller viewports.
- **Mobile breakpoint:** Currently `md:` (768px) is the sidebar collapse point. With floating panels, `lg:` (1024px) may be more appropriate to avoid cramped panels.
- **Data freshness:** Dashboard stats are fetched on mount. Add `refetchInterval` (60s) for live updates like the current sidebar.
- **Empty state:** If no documents exist yet, charts should show meaningful empty states (per chart UX guidelines).
- **Existing tests:** The chat route test mocks `fetchUsage` indirectly. Extended `UsageStats` type must be backward-compatible or the test mock needs updating.

## Design Approach

**Style:** Clean, modern SaaS dashboard. Blue brand color (existing). White cards on subtle gray background (`bg-muted/30`). Floating panels with `rounded-xl`, `border`, `shadow-sm`.

**What makes it feel "professional SaaS":**

1. KPI stat cards with icons + clear metric labels
2. Live data (not hardcoded)
3. Charts (donut + bar) showing usage breakdown
4. Floating panels with gap (modern layout pattern seen in Linear, Vercel, Sentry)
5. Lucide icons (consistent, clean)
6. Usage progress bars
7. Activity feed showing recent documents

**Chart colors:** Use existing `--chart-1` through `--chart-5` CSS variables for automatic light/dark mode support.

---

## Blockers

**NONE** — All dependencies (recharts, shadcn chart) can be installed fresh. No schema migrations needed. No env vars needed. No dependency on unmerged branches.

---

## Waiting for Approval

Does this plan look correct?

Reply with:

- ✅ **go ahead** — start implementation in order
- ✏️ **adjust** — correct scope, steps, or assumptions
- ❌ **stop** — task has changed or blockers need resolving first
