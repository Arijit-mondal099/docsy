import Image from 'next/image';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  const userInitial = session.user.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header — visible on screens < lg */}
      <header className="flex h-16 items-center gap-3 border-b bg-background px-4 lg:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="shrink-0" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar
              userName={session.user.name}
              userEmail={session.user.email ?? ''}
              userInitial={userInitial}
              isSheet
            />
          </SheetContent>
        </Sheet>
        <Image src="/logo.png" alt="Docsy" width={24} height={24} />
      </header>

      {/* Desktop — floating rounded panels */}
      <div className="hidden lg:flex gap-4 p-4 h-dvh overflow-hidden">
        {/* Sidebar panel */}
        <aside className="w-64 shrink-0">
          <div
            className="sticky top-4 rounded-xl border bg-card shadow-sm overflow-hidden"
            style={{ height: 'calc(100dvh - 2rem)' }}
          >
            <Sidebar
              userName={session.user.name}
              userEmail={session.user.email ?? ''}
              userInitial={userInitial}
            />
          </div>
        </aside>

        {/* Main content panel — scrolls independently when content overflows */}
        <main className="flex-1 rounded-xl border bg-card shadow-sm overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile content — simple stack below header */}
      <main className="lg:hidden p-4">{children}</main>
    </div>
  );
}
