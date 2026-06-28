import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { chats, messages, documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: _request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const chat = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, id), eq(chats.userId, session.user.id)))
    .then((rows) => rows[0]);

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const doc = await db
    .select()
    .from(documents)
    .where(eq(documents.id, chat.documentId))
    .then((rows) => rows[0]);

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, id))
    .orderBy(messages.createdAt);

  return NextResponse.json({
    chat,
    document: doc,
    messages: chatMessages,
  });
}