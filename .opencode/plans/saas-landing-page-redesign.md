# SaaS Landing Page Redesign

## Goal

Replace the current multi-page marketing site (separate `/features`, `/pricing`) with a single-page modern SaaS landing page that converts visitors. All 7 required sections on one scrollable page.

## Design Direction

Product = ChatPDF — document conversations with AI. Visual language evokes **clarity** (documents), **intelligence** (AI), **trust** (security), and **modernity** (SaaS).

- **Colors:** Keep existing shadcn neutral tokens **unchanged** (`--primary` stays near-black, `--primary-foreground` stays white, etc.). Add a custom `--brand` CSS variable (`oklch(0.55 0.18 260)`) for accent use on the landing page only. This avoids breaking all shadcn/ui components that depend on the neutral token group. The brand color is used sparingly — headlines, badges, hover states — not as a button background.
- **Typography:** Keep Geist (already loaded in root layout). Headings = Geist Semibold (600), Body = Geist Regular (400). No additional fonts.
- **Signature element:** In-code dashboard mockup in the hero — split view showing a PDF preview on the left and chat conversation on the right. This is the page's memorable centerpiece.
- **Animation:** Fade-in-up on scroll via a shared `components/landing/scroll-reveal.tsx` wrapper (Intersection Observer). Respect `prefers-reduced-motion`. Hover transitions at 200-300ms.
- **Grid:** 8px/16px spacing rhythm, max-w-6xl/7xl container, responsive 375px/768px/1024px/1440px.

## Files to change

| File                                   | Action                                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `app/(marketing)/layout.tsx`           | Rewrite navbar: fixed rounded glass pill, anchor links, clean footer with anchor links. Add `'use client'` for Sheet component. |
| `app/(marketing)/page.tsx`             | Full rewrite — compose all sections                                                                                             |
| `proxy.ts`                             | Remove `/features*` and `/pricing*` from public route prefixes                                                                  |
| `app/globals.css`                      | Add `--brand` token, `scroll-padding-top: 6rem` on `html`, optional fade-in keyframes                                           |
| `e2e/smoke.spec.ts`                    | Update `/features` and `/pricing` tests to test anchor sections on `/`                                                          |
| `components/landing/scroll-reveal.tsx` | NEW — client component wrapper for scroll-triggered fade-in-up                                                                  |

## Files to create

| File                                      | Purpose                                           | Client? |
| ----------------------------------------- | ------------------------------------------------- | ------- |
| `components/landing/scroll-reveal.tsx`    | Fade-in-up wrapper (Intersection Observer)        | Yes     |
| `components/landing/hero.tsx`             | Hero section with headline, CTA, dashboard mockup | No      |
| `components/landing/why-choose-us.tsx`    | 3-column stats/reasons                            | No      |
| `components/landing/features-grid.tsx`    | 6-card feature grid with Lucide icons             | No      |
| `components/landing/pricing-cards.tsx`    | Free + Pro pricing                                | No      |
| `components/landing/testimonials.tsx`     | 3 testimonial cards                               | No      |
| `components/landing/cta-section.tsx`      | Final CTA banner                                  | No      |
| `components/landing/dashboard-mockup.tsx` | In-code split-view dashboard visualization        | Yes     |
| `components/landing/index.ts`             | Barrel export for clean imports                   | —       |

## Files to delete

| File                                | Reason                                  |
| ----------------------------------- | --------------------------------------- |
| `app/(marketing)/features/page.tsx` | Content moves into single page sections |
| `app/(marketing)/pricing/page.tsx`  | Content moves into single page sections |

## Section details

### Navbar (`app/(marketing)/layout.tsx`) — `'use client'`

- **Position:** `fixed top-4 left-1/2 -translate-x-1/2 z-50`
- **Style:** `rounded-2xl border bg-background/70 backdrop-blur-xl shadow-sm`
- **Inner:** Logo (left), anchor links (center): Features, Pricing — scroll to `#why-choose-us`, `#features`, `#pricing`. Sign In + Get Started buttons (right).
- **Mobile:** Hamburger icon opens Sheet (shadcn/ui) with nav links + auth buttons.
- **Body spacing:** A spacer div above the hero (`h-20`) or `pt-20` on the main wrapper to prevent fixed nav overlap.
- **Footer:** `border-t py-12` with 3-column layout:
  - Logo + short tagline
  - Links: Features(`#features`), Pricing(`#pricing`), Privacy(`/privacy` — or remove if no page)
  - Social placeholders (GitHub, Twitter)
  - Copyright line

### Hero (`components/landing/hero.tsx`) — server component

- `min-h-[calc(100vh-6rem)]` with `flex flex-col items-center justify-center`
- Badge pill: "AI-powered document conversations"
- Gradient headline: `Chat with your **PDFs** using *AI*` — the word "PDFs" gets `text-brand` / `AI` gets `text-brand`. Gradient effect via `bg-gradient-to-r from-foreground via-brand to-foreground bg-clip-text text-transparent` on the full h1.
- Subtitle: "Upload a PDF. Ask questions. Get instant answers with citations from GPT-4o and Gemini."
- Two CTAs: "Get Started Free" (default button → `/register`) + "See it in action" (outline button, scrolls to `#features`)
- Below fold: Dashboard mockup inside a browser-frame container (`rounded-xl border shadow-xl bg-card`)

### Dashboard Mockup (`components/landing/dashboard-mockup.tsx`) — `'use client'`

- Browser chrome frame (traffic light dots + simplistic URL bar)
- Split view:
  - Left (35-40%): PDF preview placeholder — off-white `bg-muted` with rendered text lines, document title, page number
  - Right (60-65%): Chat panel — message bubbles (user = `bg-muted ml-auto`, AI = `bg-brand/10`), typing indicator, input bar
- Responsive: stacks vertically on mobile (PDF above, chat below)
- Typing indicator respects `prefers-reduced-motion`

### Why Choose Us (`components/landing/why-choose-us.tsx` — server component)

- Section `id="why-choose-us"` with `scroll-mt-24`
- 3-column grid (`md:grid-cols-3 gap-8`)
- Each: Lucide icon circle, bold stat, description
- Stats: "50ms avg. response time" (Zap) / "GPT-4o + Gemini" (Bot) / "Bank-grade encryption" (Shield)
- Hover: subtle lift effect (translateY -2px, shadow increase)

### Features Grid (`components/landing/features-grid.tsx` — server component)

- Section `id="features"` with `scroll-mt-24`
- Heading + subtitle
- 6-card grid (`md:grid-cols-2 lg:grid-cols-3 gap-6`)
- Cards with Lucide icon (Upload, MessageSquare, FileSearch, FolderOpen, History, Lock), title, description
- Content merged from old `/features` page — emojis replaced with Lucide icons

### Pricing (`components/landing/pricing-cards.tsx` — server component)

- Section `id="pricing"` with `scroll-mt-24`
- Heading + subtitle: "Start free, upgrade when you need more."
- 2 cards side by side (`md:flex-row max-w-4xl mx-auto gap-8`)
- Content from old `/pricing`:
  - **Free** ($0): 5 documents, 50 messages/mo, basic AI. Outline CTA → `/register`
  - **Pro** ($19/mo): Unlimited, GPT-4o+Gemini, priority support. Highlighted (`border-brand shadow-lg`), "Most Popular" badge (`bg-brand/10 text-brand`). Default CTA → `/register`
- Checkmark list with Lucide `Check`

### Testimonials (`components/landing/testimonials.tsx` — server component)

- Heading + subtitle: "Loved by researchers, lawyers, and students."
- 3 cards in a row (`md:grid-cols-3 gap-6`)
- Each: avatar circle (gradient initials), name, role, quote
- Content: simulated (TODO: replace with real quotes before launch)
- Uses Card component

### CTA Section (`components/landing/cta-section.tsx` — server component)

- Full-width `bg-muted/50 py-24` or `bg-gradient-to-b from-background to-muted/50`
- Centered: "Ready to transform how you read?" h2
- "Upload your first PDF free. No credit card." subtitle
- Primary CTA → `/register`

## E2E test updates (`e2e/smoke.spec.ts`)

Replace the two `/features` and `/pricing` tests with anchor section tests:

```typescript
// Before (will 404)
test('features page is accessible without auth', async ({ page }) => {
  await page.goto('/features');
  await expect(page.locator('h1').first()).toBeVisible();
});

test('pricing page is accessible without auth', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.locator('h1').first()).toBeVisible();
});

// After (anchor sections on landing page)
test('features section exists on landing page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#features')).toBeVisible();
});

test('pricing section exists on landing page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#pricing')).toBeVisible();
});
```

## CSS changes (`app/globals.css`)

```css
/* Brand accent token (landing page only) */
:root {
  --brand: oklch(0.55 0.18 260);
}
.dark {
  --brand: oklch(0.65 0.15 260);
}

/* Anchor scroll offset for fixed navbar */
html {
  scroll-padding-top: 6rem;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

Add to `@theme inline`:

```css
--color-brand: var(--brand);
```

## Implementation order

1. `globals.css` — add CSS tokens, scroll-padding
2. `components/landing/scroll-reveal.tsx` — shared animation wrapper
3. `components/landing/dashboard-mockup.tsx` — most complex visual piece
4. `components/landing/why-choose-us.tsx`
5. `components/landing/features-grid.tsx`
6. `components/landing/pricing-cards.tsx`
7. `components/landing/testimonials.tsx`
8. `components/landing/cta-section.tsx`
9. `components/landing/hero.tsx` (depends on dashboard-mockup)
10. `components/landing/index.ts` — barrel export
11. Rewrite `app/(marketing)/layout.tsx` — nav + footer (mark as `'use client'` for Sheet)
12. Rewrite `app/(marketing)/page.tsx` — compose all sections
13. Update `proxy.ts` — remove `/features*` and `/pricing*`
14. Delete old `app/(marketing)/features/page.tsx` and `app/(marketing)/pricing/page.tsx`
15. Update `e2e/smoke.spec.ts` — replace /features and /pricing tests

## Verification

1. `pnpm typecheck` — no type errors
2. `pnpm test` — all 10 unit tests pass
3. `pnpm test:e2e` — all Playwright tests pass (requires `pnpm dev` running)
4. Manual checks:
   - Page at `/` renders all 7 sections
   - Navbar is fixed rounded glass pill
   - All anchor links scroll to correct sections (not hidden under navbar)
   - Mobile responsive (375px) — no horizontal scroll, nav collapses to hamburger
   - Dark mode — all sections readable, contrast 4.5:1+
   - `/features` and `/pricing` return 404 (no longer exist)
   - `/login`, `/register`, `/` remain public (proxy check)
5. Lighthouse: no layout shift, no broken links, reasonable performance
