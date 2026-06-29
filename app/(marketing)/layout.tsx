'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { AuthProvider, useAuthModal } from '@/components/auth/auth-context';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function DesktopSignInButton() {
  const { openSignIn } = useAuthModal();
  return (
    <Button variant="ghost" size="sm" onClick={openSignIn}>
      Sign In
    </Button>
  );
}

function DesktopGetStartedButton() {
  const { openSignUp } = useAuthModal();
  return (
    <Button size="sm" onClick={openSignUp}>
      Get Started
    </Button>
  );
}

function MobileSignInButton({ onClose }: { onClose: () => void }) {
  const { openSignIn } = useAuthModal();
  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => {
        onClose();
        openSignIn();
      }}
    >
      Sign In
    </Button>
  );
}

function MobileGetStartedButton({ onClose }: { onClose: () => void }) {
  const { openSignUp } = useAuthModal();
  return (
    <Button
      className="w-full"
      onClick={() => {
        onClose();
        openSignUp();
      }}
    >
      Get Started
    </Button>
  );
}

const navLinks = [
  { href: '#why-choose-us', label: 'Why Us' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const close = () => setOpen(false);

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        {/* Fixed glass navbar */}
        <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 rounded-2xl border bg-background/70 px-4 py-2 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
          <div className="flex h-12 items-center justify-between md:grid md:grid-cols-3">
            <Link href="/" className="text-lg font-bold tracking-tight md:justify-self-start">
              <Image src="/logo.png" alt="Docsy" width={24} height={24} />
            </Link>

            {/* Desktop nav — centered */}
            <nav className="hidden items-center gap-1 md:flex md:justify-self-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop auth buttons + theme toggle */}
            <div className="hidden items-center gap-2 md:flex md:justify-self-end">
              {/* GitHub */}
              <Button
                variant="ghost"
                size="icon"
                nativeButton={false}
                aria-label="GitHub repository"
                render={
                  <a
                    href="https://github.com/Arijit-mondal099/docsy"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <GitHubIcon className="size-4" />
              </Button>
              {/* Theme toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {mounted ? (
                  theme === 'dark' ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )
                ) : (
                  <div className="size-4" />
                )}
              </Button>
              <DesktopSignInButton />
              <DesktopGetStartedButton />
            </div>

            {/* Mobile hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="md:hidden"
                render={
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 p-4 pt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-2 border-border" />
                  <a
                    href="https://github.com/Arijit-mondal099/docsy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <GitHubIcon className="size-4" />
                    GitHub
                  </a>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={toggleTheme}
                  >
                    {mounted ? (
                      theme === 'dark' ? (
                        <>
                          <Sun className="size-4" /> Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="size-4" /> Dark Mode
                        </>
                      )
                    ) : (
                      <div className="size-4" />
                    )}
                  </Button>
                  <MobileSignInButton onClose={close} />
                  <MobileGetStartedButton onClose={close} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Spacer for fixed navbar */}
        <div className="h-20" />

        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-8 md:flex-row md:justify-between">
              <div className="max-w-xs">
                <Link href="/" className="text-lg font-bold tracking-tight">
                  <Image src="/logo.png" alt="Docsy" width={24} height={24} />
                </Link>
                <p className="mt-3 text-sm text-muted-foreground">
                  Turn your PDFs into conversations. Upload, ask, and get answers instantly.
                </p>
              </div>

              <div className="flex flex-wrap gap-8">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Product
                  </p>
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Legal
                  </p>
                  <nav className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Privacy Policy</span>
                    <span className="text-sm text-muted-foreground">Terms of Service</span>
                  </nav>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Connect
                  </p>
                  <div className="flex gap-3 text-muted-foreground">
                    <span className="text-sm transition-colors hover:text-foreground">GitHub</span>
                    <span className="text-sm transition-colors hover:text-foreground">Twitter</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Docsy. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
