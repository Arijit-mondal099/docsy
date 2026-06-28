import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId } = await request.json();

  if (!documentId) {
    return NextResponse.json(
      { error: 'documentId is required' },
      { status: 400 },
    );
  }

  // Check for existing chat
  const existing = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.documentId, documentId),
        eq(chats.userId, session.user.id),
      ),
    )
    .then((rows) => rows[0]);

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  // Create new chat
  const [chat] = await db
    .insert(chats)
    .values({
      documentId,
      userId: session.user.id,
    })
    .returning();

  return NextResponse.json({ id: chat.id });
}