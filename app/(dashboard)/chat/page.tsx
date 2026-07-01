import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus } from 'lucide-react';

export default async function ChatIndexPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex -m-6" style={{ height: 'calc(100dvh - 5rem)' }}>
      {/* Conversation sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r bg-muted/20">
        <ChatSidebar />
      </aside>

      {/* Placeholder — no chat selected */}
      <div className="flex-1 min-w-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <MessageSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Select a conversation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a conversation from the sidebar or start a new one
            </p>
          </div>
          <Link
            href="/documents"
            className={cn(buttonVariants({ variant: 'default' }), 'inline-flex items-center')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Link>
        </div>
      </div>
    </div>
  );
}
