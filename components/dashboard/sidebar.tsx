'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchUsage, type UsageStats } from '@/lib/api';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSyncExternalStore } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  LogOut,
  Sun,
  Moon,
  CreditCard,
  Crown,
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  userName: string | null;
  userEmail: string;
  userInitial: string;
  userPlan?: string;
  isSheet?: boolean;
  onNavClick?: () => void;
}

function UsageBadge({ stats }: { stats: UsageStats }) {
  const isUnlimited = stats.documentLimit === -1 || stats.messageLimit === -1;
  const docPercent = isUnlimited
    ? 100
    : Math.min(Math.round((stats.documentsUploaded / stats.documentLimit) * 100), 100);
  const msgPercent = isUnlimited
    ? 100
    : Math.min(Math.round((stats.messagesSent / stats.messageLimit) * 100), 100);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Usage
        </p>
        {stats.plan !== 'free' && (
          <Badge variant="secondary" className="text-xs">
            {stats.plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly'}
          </Badge>
        )}
      </div>
      <div className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Documents</span>
            <span className="font-medium tabular-nums">
              {stats.documentsUploaded} / {isUnlimited ? '∞' : stats.documentLimit}
            </span>
          </div>
          <Progress value={docPercent} className="h-1.5" />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Messages</span>
            <span className="font-medium tabular-nums">
              {stats.messagesSent} / {isUnlimited ? '∞' : stats.messageLimit}
            </span>
          </div>
          <Progress value={msgPercent} className="h-1.5" />
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  userName,
  userEmail,
  userInitial,
  userPlan = 'free',
  isSheet: _isSheet,
  onNavClick,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { data: usageStats, isLoading: usageLoading } = useQuery({
    queryKey: ['usage'],
    queryFn: fetchUsage,
    refetchInterval: 30_000,
  });

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    router.push('/');
  };

  const isFree = usageStats ? usageStats.plan === 'free' : userPlan === 'free';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/chat', label: 'Chats', icon: MessageSquare },
    { href: '/billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="flex h-full w-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <Link
          href="/dashboard"
          className="flex items-center font-bold text-xl"
          onClick={onNavClick}
        >
          <Image src="/logo.png" alt="Docsy" width={28} height={28} className="shrink-0" />
          <span>Docsy</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              data-active={isActive || undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[active]:bg-primary/10 data-[active]:text-primary data-[active]:font-semibold"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usage section */}
      <div className="px-3 pb-3">
        {usageLoading ? (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        ) : usageStats ? (
          <UsageBadge stats={usageStats} />
        ) : null}

        {/* Upgrade button for free users */}
        {isFree && usageStats && (
          <div className="mt-3">
            <Link
              href="/billing"
              className="flex w-full items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
              onClick={onNavClick}
            >
              <Crown className="h-4 w-4 shrink-0" />
              <span>Upgrade to Pro</span>
            </Link>
          </div>
        )}
      </div>

      {/* User section */}
      <div className="border-t p-3 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {userInitial}
          </div>
          <div className="flex-1 truncate min-w-0">
            <p className="text-sm font-medium truncate">{userName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
