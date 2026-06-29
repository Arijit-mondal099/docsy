'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchDashboardStats, type DashboardStats } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import {
  FileText,
  MessageSquare,
  MessagesSquare,
  Gauge,
  Upload,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ChartConfig } from '@/components/ui/chart';

// ── Chart colors ──

const CHART_COLORS = {
  used: 'var(--chart-1)',
  remaining: 'var(--chart-3)',
  ready: 'var(--chart-2)',
  processing: 'var(--chart-4)',
  pending: 'var(--chart-5)',
  error: 'var(--destructive)',
};

// ── Usage donut config ──

const usageChartConfig = {
  value: {
    label: 'Count',
  },
  used: {
    label: 'Used',
    color: CHART_COLORS.used,
  },
  remaining: {
    label: 'Remaining',
    color: CHART_COLORS.remaining,
  },
} satisfies ChartConfig;

// ── Document status bar config ──

const statusChartConfig = {
  count: {
    label: 'Documents',
  },
  ready: {
    label: 'Ready',
    color: CHART_COLORS.ready,
  },
  processing: {
    label: 'Processing',
    color: CHART_COLORS.processing,
  },
  pending: {
    label: 'Pending',
    color: CHART_COLORS.pending,
  },
  error: {
    label: 'Error',
    color: CHART_COLORS.error,
  },
} satisfies ChartConfig;

// ── Loading skeleton for the full dashboard ──

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48 mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// ── Quick actions row ──

function QuickActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => router.push('/documents')}>
        <Upload className="mr-2 h-4 w-4" />
        Upload PDF
      </Button>
      <Button variant="outline" onClick={() => router.push('/documents')}>
        <Sparkles className="mr-2 h-4 w-4" />
        New Chat
      </Button>
      <Button variant="ghost" onClick={() => router.push('/documents')}>
        View All Documents
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Recent documents list ──

function RecentDocuments({ docs }: { docs: DashboardStats['recentDocuments'] }) {
  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Upload your first PDF to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/30"
        >
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="shrink-0">
            <span
              className={`
                inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                ${doc.status === 'ready' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                ${doc.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                ${doc.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                ${doc.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
              `}
            >
              {doc.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard page ──

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000,
  });

  if (isLoading || !stats) {
    return <DashboardSkeleton />;
  }

  // Donut chart data — documents usage
  const docUsageData = [
    {
      name: 'used',
      value: stats.documentsUploaded,
      fill: CHART_COLORS.used,
    },
    {
      name: 'remaining',
      value: Math.max(stats.documentLimit - stats.documentsUploaded, 0),
      fill: CHART_COLORS.remaining,
    },
  ];

  // Donut chart data — messages usage
  const msgUsageData = [
    {
      name: 'used',
      value: stats.messagesSent,
      fill: CHART_COLORS.used,
    },
    {
      name: 'remaining',
      value: Math.max(stats.messageLimit - stats.messagesSent, 0),
      fill: CHART_COLORS.remaining,
    },
  ];

  // Bar chart data — document status
  const statusData = [
    { name: 'ready', count: stats.readyDocuments, fill: CHART_COLORS.ready },
    { name: 'processing', count: stats.processingDocuments, fill: CHART_COLORS.processing },
    { name: 'pending', count: stats.pendingDocuments, fill: CHART_COLORS.pending },
    { name: 'error', count: stats.errorDocuments, fill: CHART_COLORS.error },
  ].filter((d) => d.count > 0);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Here&apos;s your usage overview</p>
      </div>

      {/* KPI stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents"
          value={`${stats.documentsUploaded} / ${stats.documentLimit}`}
          subtitle="Total uploaded"
          icon={FileText}
          trend={{ value: `${stats.totalDocuments} total in system`, positive: true }}
        />
        <StatCard
          title="Messages"
          value={`${stats.messagesSent} / ${stats.messageLimit}`}
          subtitle="Sent this period"
          icon={MessageSquare}
          trend={{ value: `${stats.totalMessages} total all time`, positive: true }}
        />
        <StatCard
          title="Chats"
          value={stats.totalChats}
          subtitle="Conversations started"
          icon={MessagesSquare}
        />
        <StatCard
          title="Usage"
          value={`${stats.usagePercentages.documents}%`}
          subtitle="Of document limit used"
          icon={Gauge}
          trend={{
            value: `${stats.usagePercentages.messages}% message limit used`,
            positive: stats.usagePercentages.messages < 80,
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Document usage donut */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-1">Document Usage</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {stats.documentsUploaded} of {stats.documentLimit} documents used
          </p>
          <ChartContainer config={usageChartConfig} className="aspect-square max-h-56">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={docUsageData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                strokeWidth={2}
              >
                {docUsageData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </div>

        {/* Message usage donut */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-1">Message Usage</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {stats.messagesSent} of {stats.messageLimit} messages used
          </p>
          <ChartContainer config={usageChartConfig} className="aspect-square max-h-56">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={msgUsageData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                strokeWidth={2}
              >
                {msgUsageData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </div>

        {/* Document status bar chart */}
        {statusData.length > 0 && (
          <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-semibold mb-1">Document Status</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Breakdown of your {stats.totalDocuments} documents
            </p>
            <ChartContainer config={statusChartConfig} className="max-h-48">
              <BarChart data={statusData} layout="vertical" barSize={28}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>

      {/* Recent documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Documents</h2>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <RecentDocuments docs={stats.recentDocuments} />
      </div>

      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}
