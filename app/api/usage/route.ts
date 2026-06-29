import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getUsage, FREE_DOCUMENT_LIMIT, FREE_MESSAGE_LIMIT } from '@/lib/db/usage';
import { db } from '@/lib/db';
import { documents, chats, messages } from '@/lib/db/schema';
import { eq, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const isDashboard = request.nextUrl.searchParams.get('dashboard') === 'true';

  const usageStats = await getUsage(userId);

  // For basic usage fetch, return minimal response
  if (!isDashboard) {
    return NextResponse.json(usageStats);
  }

  // Enriched dashboard analytics
  const docCounts = await db
    .select({
      total: count(),
      ready: sql<number>`COUNT(CASE WHEN status = 'ready' THEN 1 END)`,
      processing: sql<number>`COUNT(CASE WHEN status = 'processing' THEN 1 END)`,
      pending: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
      error: sql<number>`COUNT(CASE WHEN status = 'error' THEN 1 END)`,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .then((rows) => rows[0]);

  const [chatCountResult] = await db
    .select({ count: count() })
    .from(chats)
    .where(eq(chats.userId, userId));

  const [messageCountResult] = await db
    .select({ count: count() })
    .from(messages)
    .innerJoin(chats, eq(messages.chatId, chats.id))
    .where(eq(chats.userId, userId));

  const recentDocs = await db
    .select({
      id: documents.id,
      name: documents.name,
      status: documents.status,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(documents.createdAt)
    .limit(5);

  return NextResponse.json({
    ...usageStats,
    totalDocuments: Number(docCounts.total),
    readyDocuments: Number(docCounts.ready),
    processingDocuments: Number(docCounts.processing),
    pendingDocuments: Number(docCounts.pending),
    errorDocuments: Number(docCounts.error),
    totalChats: Number(chatCountResult?.count ?? 0),
    totalMessages: Number(messageCountResult?.count ?? 0),
    usagePercentages: {
      documents: Math.min(
        Math.round((usageStats.documentsUploaded / FREE_DOCUMENT_LIMIT) * 100),
        100,
      ),
      messages: Math.min(Math.round((usageStats.messagesSent / FREE_MESSAGE_LIMIT) * 100), 100),
    },
    recentDocuments: recentDocs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      status: doc.status as 'pending' | 'processing' | 'ready' | 'error',
      createdAt: doc.createdAt.toISOString(),
    })),
  });
}
