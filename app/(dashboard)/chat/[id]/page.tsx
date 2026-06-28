import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { chats, messages, documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { ChatPanel } from '@/components/chat/chat-panel';
import { headers } from 'next/headers';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  const chat = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, id), eq(chats.userId, session.user.id)))
    .then((rows) => rows[0]);

  if (!chat) {
    notFound();
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, chat.documentId));

  const dbMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, id))
    .orderBy(messages.createdAt);

  const initialMessages: Message[] = dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    createdAt: msg.createdAt,
  }));

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatPanel
        chatId={id}
        documentId={chat.documentId}
        documentUrl={doc?.cloudinaryUrl}
        documentName={doc?.name}
        initialMessages={initialMessages}
      />
    </div>
  );
}