import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { chats, messages, documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { headers } from 'next/headers';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
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
    .select({ name: documents.name })
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
    <div className="flex h-[calc(100dvh-5rem-2px)]">
      {/* Conversation sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r bg-muted/20">
        <ChatSidebar currentChatId={id} />
      </aside>

      {/* Chat panel */}
      <div className="flex-1 min-w-0">
        <ChatPanel
          chatId={id}
          documentId={chat.documentId}
          documentName={doc?.name}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
