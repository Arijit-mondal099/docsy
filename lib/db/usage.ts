import { db } from '@/lib/db';
import { usage } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const FREE_DOCUMENT_LIMIT = 5;
export const FREE_MESSAGE_LIMIT = 50;

export type UsageStats = {
  documentsUploaded: number;
  messagesSent: number;
  resetDate: Date;
  documentLimit: number;
  messageLimit: number;
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

export async function getUsage(userId: string): Promise<UsageStats> {
  await ensureUsageRecord(userId);

  const row = await db
    .select()
    .from(usage)
    .where(eq(usage.userId, userId))
    .then((rows) => rows[0]);

  return {
    documentsUploaded: row?.documentsUploaded ?? 0,
    messagesSent: row?.messagesSent ?? 0,
    resetDate: row?.resetDate ?? new Date(),
    documentLimit: FREE_DOCUMENT_LIMIT,
    messageLimit: FREE_MESSAGE_LIMIT,
  };
}

export async function tryIncrementDocumentsUploaded(
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  await ensureUsageRecord(userId);

  // Atomic check-and-increment: only +1 if under the limit
  const result = await db
    .update(usage)
    .set({
      documentsUploaded: sql`${usage.documentsUploaded} + 1`,
    })
    .where(sql`${usage.userId} = ${userId} AND ${usage.documentsUploaded} < ${FREE_DOCUMENT_LIMIT}`)
    .returning({ count: usage.documentsUploaded });

  const exceeded = result.length === 0;
  if (exceeded) {
    return {
      allowed: false,
      reason: `You've reached the free tier limit of ${FREE_DOCUMENT_LIMIT} documents. Upgrade to Pro for unlimited uploads.`,
    };
  }
  return { allowed: true };
}

export async function tryIncrementMessagesSent(
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  await ensureUsageRecord(userId);

  // Atomic check-and-increment: only +1 if under the limit
  const result = await db
    .update(usage)
    .set({
      messagesSent: sql`${usage.messagesSent} + 1`,
    })
    .where(sql`${usage.userId} = ${userId} AND ${usage.messagesSent} < ${FREE_MESSAGE_LIMIT}`)
    .returning({ count: usage.messagesSent });

  const exceeded = result.length === 0;
  if (exceeded) {
    return {
      allowed: false,
      reason: `You've reached the free tier limit of ${FREE_MESSAGE_LIMIT} messages per month. Upgrade to Pro for unlimited messages.`,
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
  if (stats.documentsUploaded >= stats.documentLimit) {
    return {
      allowed: false,
      reason: `You've reached the free tier limit of ${stats.documentLimit} documents. Upgrade to Pro for unlimited uploads.`,
    };
  }
  return { allowed: true };
}

export async function checkMessageAllowed(
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const stats = await getUsage(userId);
  if (stats.messagesSent >= stats.messageLimit) {
    return {
      allowed: false,
      reason: `You've reached the free tier limit of ${stats.messageLimit} messages per month. Upgrade to Pro for unlimited messages.`,
    };
  }
  return { allowed: true };
}
