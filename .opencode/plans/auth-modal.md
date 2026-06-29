# Auth Modal — Replace Sign In / Sign Up page links with modals

## Task

Replace all Sign In / Get Started **Link** elements across the marketing site with modal dialogs containing the auth forms. Both modals must include a Google OAuth button. The standalone `/login` and `/register` page routes remain for direct access (bookmarks, reset-password flow).

---

## Files to create

### `components/ui/dialog.tsx`

Centered dialog component wrapping `@base-ui/react/dialog`, following the same pattern as `sheet.tsx`. Exports:

- `Dialog` (Root)
- `DialogTrigger`
- `DialogClose`
- `DialogPortal`
- `DialogOverlay` — fixed inset backdrop
- `DialogContent` — centered popup (`fixed inset-0 flex items-center justify-center`)
- `DialogHeader`
- `DialogTitle`
- `DialogDescription`

### `components/auth/auth-context.tsx`

React context providing modal control to any descendant component:

- `AuthModalContext` type: `{ openSignIn: () => void; openSignUp: () => void; closeAuthModal: () => void }`
- `AuthProvider` — holds `isOpen` + `mode` state, renders `<Dialog>`, `DialogContent`, and the form content
- `useAuthModal()` hook — returns context functions

### `components/auth/auth-modal.tsx`

The actual form content rendered inside the dialog:

- Props: `mode: 'login' | 'register'`
- **Sign-in form**: email + password + Google button
- **Sign-up form**: name + email + password + Google button
- Inline toggle: "Don't have an account? Sign up" / "Already have an account? Sign in" — switches `mode`
- Google OAuth via `authClient.signIn.social({ provider: 'google' })` (same as existing login page)
- Error state, loading state, redirect to `/dashboard` on success

---

## Files to modify

### `app/(marketing)/layout.tsx`

- Import `AuthProvider` and wrap content
- Desktop navbar (lines 94–101):
  - Replace `<Link href="/login"><Button variant="ghost">Sign In</Button></Link>` → `<Button variant="ghost" onClick={openSignIn}>Sign In</Button>`
  - Replace `<Link href="/register"><Button>Get Started</Button></Link>` → `<Button onClick={openSignUp}>Get Started</Button>`
- Mobile sheet (lines 155–162): same replacements

### `components/landing/hero.tsx`

- Import `useAuthModal`
- Replace `<Link href="/register"><Button>Get Started Free</Button></Link>` → `<Button onClick={openSignUp}>Get Started Free</Button>`

### `components/landing/cta-section.tsx`

- Add `'use client'` (or extract a small client wrapper `CtaButton`)
- Import `useAuthModal`
- Replace `<Link href="/register"><Button>Get Started Free</Button></Link>` → `<Button onClick={openSignUp}>Get Started Free</Button>`

### `app/(auth)/register/page.tsx` — optional parity fix

Add Google OAuth button to the standalone register page (currently missing it). Copy the SVG + handler pattern from login page.

---

## Files NOT touched

- `app/(auth)/login/page.tsx` — standalone page kept
- `app/(auth)/register/page.tsx` — standalone page kept (Google button added as parity fix)
- `app/(auth)/reset-password/page.tsx` — links to `/login`, still works
- `app/(auth)/layout.tsx` — still redirects authenticated users
- Any dashboard, chat, or authenticated pages
- Any DB, API, or server-side logic

---

## Implementation order

1. `components/ui/dialog.tsx` — create centered dialog primitive
2. `components/auth/auth-context.tsx` — create context + provider
3. `components/auth/auth-modal.tsx` — create form content
4. `app/(marketing)/layout.tsx` — integrate provider + replace navbar links
5. `components/landing/hero.tsx` — replace hero CTA link
6. `components/landing/cta-section.tsx` — replace CTA section link
7. `app/(auth)/register/page.tsx` — add Google button for parity

---

## Risks & unknowns

- `@base-ui/react/dialog` popup positioning for centered modals needs correct Tailwind classes (already confirmed: `fixed inset-0 flex items-center justify-center` with `max-w-md`)
- The register page currently lacks a Google button — adding it is minor scope but makes the modal and page consistent
