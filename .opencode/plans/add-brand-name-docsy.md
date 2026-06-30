# Add brand name "Docsy" next to logo

## Date

2026-06-30

## Task

Add the brand name "Docsy" text next to the logo image in all 4 locations
where the logo appears across the app.

## Files Changed

**Must change:**

- `components/dashboard/sidebar.tsx:104` — add `<span>Docsy</span>` after `<Image>`
- `app/(dashboard)/layout.tsx:38` — wrap standalone `<Image>` in `<Link href="/dashboard">` with flex layout + "Docsy" text
- `app/(marketing)/layout.tsx:100` — add `<span>Docsy</span>` after navbar `<Image>`
- `app/(marketing)/layout.tsx:220` — add `<span>Docsy</span>` after footer `<Image>`

## Implementation Details

### 1. Dashboard sidebar (`components/dashboard/sidebar.tsx:104`)

```tsx
// Before:
<Image src="/logo.png" alt="Docsy" width={28} height={28} className="shrink-0" />

// After:
<Image src="/logo.png" alt="Docsy" width={28} height={28} className="shrink-0" />
<span>Docsy</span>
```

The parent `<Link>` already has `flex items-center font-bold text-xl`.

### 2. Dashboard mobile header (`app/(dashboard)/layout.tsx:38`)

```tsx
// Before:
<Image src="/logo.png" alt="Docsy" width={24} height={24} />

// After:
<Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
  <Image src="/logo.png" alt="Docsy" width={24} height={24} />
  <span>Docsy</span>
</Link>
```

### 3. Marketing navbar (`app/(marketing)/layout.tsx:100`)

```tsx
// Before:
<Link href="/" className="text-lg font-bold tracking-tight md:justify-self-start">
  <Image src="/logo.png" alt="Docsy" width={24} height={24} />
</Link>

// After:
<Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight md:justify-self-start">
  <Image src="/logo.png" alt="Docsy" width={24} height={24} />
  <span>Docsy</span>
</Link>
```

### 4. Marketing footer (`app/(marketing)/layout.tsx:220`)

```tsx
// Before:
<Link href="/" className="text-lg font-bold tracking-tight">
  <Image src="/logo.png" alt="Docsy" width={24} height={24} />
</Link>

// After:
<Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
  <Image src="/logo.png" alt="Docsy" width={24} height={24} />
  <span>Docsy</span>
</Link>
```

## Verification

- `pnpm typecheck` passes
- Visual: "Docsy" text visible next to logo in:
  - Landing page navbar
  - Landing page footer
  - Dashboard sidebar
  - Dashboard mobile header (mobile viewport)
