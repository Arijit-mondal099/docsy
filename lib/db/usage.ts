import { db } from '@/lib/db';
import { usage, user } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getPlanLimits, isUnlimited } from '@/lib/payments/plans';

export type UsageStats = {
  documentsUploaded: number;
  messagesSent: number;
  resetDate: Date;
  documentLimit: number;
  messageLimit: number;
  plan: string;
};

async function ensureUsageRecord(userId: string): Promise<void> {
  await db
    .insert(usage)
    .values({
      userId,
      documentsUploaded: 0,
      messagesSent: 0,
      resetDate: new Date(),
    })
    .onConflictDoNothing();
}

async function getUserPlan(userId: string): Promise<string> {
  const row = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, userId))
    .then((rows) => rows[0]);
  return row?.plan ?? 'free';
}

function getLimitMessage(plan: string, limit: number, resource: string): string {
  if (plan === 'free') {
    return `You've reached the free tier limit of ${limit} ${resource}. Upgrade to Pro for unlimited ${resource}.`;
  }
  return `You've reached your ${plan} plan limit of ${limit} ${resource}.`;
}

export async function getUsage(userId: string): Promise<UsageStats> {
  await ensureUsageRecord(userId);

  const [usageRow, plan] = await Promise.all([
    db
      .select()
      .from(usage)
      .where(eq(usage.userId, userId))
      .then((rows) => rows[0]),
    getUserPlan(userId),
  ]);

  const limits = getPlanLimits(plan as 'free' | 'pro_monthly' | 'pro_yearly');

  return {
    documentsUploaded: usageRow?.documentsUploaded ?? 0,
    messagesSent: usageRow?.messagesSent ?? 0,
    resetDate: usageRow?.resetDate ?? new Date(),
    documentLimit: limits.documentLimit,
    messageLimit: limits.messageLimit,
    plan,
  };
}

export async function tryIncrementDocumentsUploaded(
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  await ensureUsageRecord(userId);

  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan as 'free' | 'pro_monthly' | 'pro_yearly');

  // If unlimited, always allow
  if (isUnlimited(limits.documentLimit)) {
    await db
      .update(usage)
      .set({
        documentsUploaded: sql`${usage.documentsUploaded} + 1`,
      })
      .where(eq(usage.userId, userId));
    return { allowed: true };
  }

  // Atomic check-and-increment: only +1 if under the limit
  const result = await db
    .update(usage)
    .set({
      documentsUploaded: sql`${usage.documentsUploaded} + 1`,
    })
    .where(
      sql`${usage.userId} = ${userId} AND ${usage.documentsUploaded} < ${limits.documentLimit}`,
    )
    .returning({ count: usage.documentsUploaded });

  const exceeded = result.length === 0;
  if (exceeded) {
    return {
      allowed: false,
      reason: getLimitMessage(plan, limits.documentLimit, 'documents'),
    };
  }
  return { allowed: true };
}

export async function tryIncrementMessagesSent(
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  await ensureUsageRecord(userId);

  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan as 'free' | 'pro_monthly' | 'pro_yearly');

  // If unlimited, always allow
  if (isUnlimited(limits.messageLimit)) {
    await db
      .update(usage)
      .set({
        messagesSent: sql`${usage.messagesSent} + 1`,
      })
      .where(eq(usage.userId, userId));
    return { allowed: true };
  }

  // Atomic check-and-increment: only +1 if under the limit
  const result = await db
    .update(usage)
    .set({
      messagesSent: sql`${usage.messagesSent} + 1`,
    })
    .where(sql`${usage.userId} = ${userId} AND ${usage.messagesSent} < ${limits.messageLimit}`)
    .returning({ count: usage.messagesSent });

  const exceeded = result.length === 0;
  if (exceeded) {
    return {
      allowed: false,
      reason: getLimitMessage(plan, limits.messageLimit, 'messages'),
    };
  }
  return { allowed: true };
}

/** @deprecated Use tryIncrementDocumentsUploaded for atomic check+increment */
export async function incrementDocumentsUploaded(userId: string): Promise<void> {
  await ensureUsageRecord(userId);

  await db
    .update(usage)
    .set({
      documentsUploaded: sql`${usage.documentsUploaded} + 1`,
    })
    .where(eq(usage.userId, userId));
}

/** @deprecated Use tryIncrementMessagesSent for atomic check+increment */
export async function incrementMessagesSent(userId: string): Promise<void> {
  await ensureUsageRecord(userId);

  await db
    .update(usage)
    .set({
      messagesSent: sql`${usage.messagesSent} + 1`,
    })
    .where(eq(usage.userId, userId));
}

export async function checkDocumentUploadAllowed(
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const stats = await getUsage(userId);
  if (stats.documentsUploaded >= stats.documentLimit && stats.documentLimit !== -1) {
    return {
      allowed: false,
      reason: getLimitMessage(stats.plan, stats.documentLimit, 'documents'),
    };
  }
  return { allowed: true };
}

export async function checkMessageAllowed(
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const stats = await getUsage(userId);
  if (stats.messagesSent >= stats.messageLimit && stats.messageLimit !== -1) {
    return {
      allowed: false,
      reason: getLimitMessage(stats.plan, stats.messageLimit, 'messages'),
    };
  }
  return { allowed: true };
}
