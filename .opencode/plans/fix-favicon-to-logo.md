# Fix: Favicon not showing as logo.png

## Date

2026-06-30

## Task

Browser tab favicon shows a default Next.js-generated icon instead of our `/logo.png`.

## Root Cause

`app/favicon.ico` (25931 bytes) exists in the Next.js App Router directory.
Next.js auto-detects it and generates a `<link rel="icon">` for it in the `<head>`,
placed BEFORE our custom metadata `icons.icon: '/logo.png'`.

The rendered HTML:

```html
<link
  rel="icon"
  href="/favicon.ico?favicon.2vob68tjqpejf.ico"
  sizes="256x256"
  type="image/x-icon"
/>
<!-- auto-gen -->
<link rel="icon" href="/logo.png" />
<!-- our config -->
```

Browsers use the first icon link — ignoring our `/logo.png`.

## Fix

Delete `app/favicon.ico`. The existing metadata config in `app/layout.tsx:22`
(`icons.icon: '/logo.png'`) will then be the sole favicon source.

## Verification

- `curl http://localhost:3000/favicon.ico` → 404 (after restart)
- Check `<head>` HTML → only `<link rel="icon" href="/logo.png" />` present
- Browser tab icon shows the Docsy logo (may need hard refresh / incognito)
