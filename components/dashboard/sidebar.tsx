'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchUsage, type UsageStats } from '@/lib/api';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarProps {
  userName: string | null;
  userEmail: string;
  userInitial: string;
  isSheet?: boolean;
  onNavClick?: () => void;
}

function UsageBadge({ stats }: { stats: UsageStats }) {
  return (
    <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
      <p className="text-xs font-medium text-muted-foreground">Usage</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Documents</span>
          <span className="font-medium">
            {stats.documentsUploaded} / {stats.documentLimit}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Messages</span>
          <span className="font-medium">
            {stats.messagesSent} / {stats.messageLimit}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  userName,
  userEmail,
  userInitial,
  isSheet: _isSheet,
  onNavClick,
}: SidebarProps) {
  const router = useRouter();

  const { data: usageStats, isLoading: usageLoading } = useQuery({
    queryKey: ['usage'],
    queryFn: fetchUsage,
    refetchInterval: 30_000, // refresh every 30s
  });

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    router.push('/');
  };

  const navLinkClass =
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={onNavClick}
        >
          <span className="text-primary">Chat</span>PDF
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <Link href="/dashboard" className={navLinkClass} onClick={onNavClick}>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
          Dashboard
        </Link>
        <Link href="/documents" className={navLinkClass} onClick={onNavClick}>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          Documents
        </Link>
      </nav>

      <div className="space-y-3 px-4 pb-4">
        {usageLoading ? (
          <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        ) : usageStats ? (
          <UsageBadge stats={usageStats} />
        ) : null}
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {userInitial}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">{userName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
