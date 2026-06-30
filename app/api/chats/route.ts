import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { chats, documents, messages } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select({
      id: chats.id,
      documentId: chats.documentId,
      documentName: documents.name,
      name: chats.name,
      createdAt: chats.createdAt,
      lastMessage: sql<string>`(
        SELECT content FROM messages
        WHERE messages.chat_id = chats.id
        ORDER BY messages.created_at DESC
        LIMIT 1
      )`,
      messageCount: sql<number>`(
        SELECT COUNT(*) FROM messages
        WHERE messages.chat_id = chats.id
      )`,
    })
    .from(chats)
    .leftJoin(documents, eq(chats.documentId, documents.id))
    .where(eq(chats.userId, session.user.id))
    .orderBy(desc(chats.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId } = await request.json();

  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
  }

  // Check for existing chat
  const existing = await db
    .select()
    .from(chats)
    .where(and(eq(chats.documentId, documentId), eq(chats.userId, session.user.id)))
    .then((rows) => rows[0]);

  if (existing) {
    return NextResponse.json({
      id: existing.id,
      documentId: existing.documentId,
      name: existing.name,
    });
  }

  // Create new chat
  const [chat] = await db
    .insert(chats)
    .values({
      documentId,
      userId: session.user.id,
    })
    .returning();

  return NextResponse.json({ id: chat.id, documentId: chat.documentId, name: chat.name });
}
