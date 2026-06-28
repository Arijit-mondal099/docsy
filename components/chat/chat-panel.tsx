'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface ChatPanelProps {
  chatId: string;
  documentId: string;
  documentUrl?: string;
  documentName?: string;
  initialMessages?: Message[];
}

export function ChatPanel({
  chatId,
  documentId,
  documentUrl,
  documentName,
  initialMessages = [],
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<string>('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      lastSentRef.current = content;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            id: chatId,
            documentId,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to send message');
        }

        // Read streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '',
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          fullContent += text;

          // Update the assistant message content as it streams
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = { ...last, content: fullContent };
            }
            return updated;
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },

    [messages, isLoading, chatId, documentId],
  );

  const handleRetry = () => {
    if (lastSentRef.current) {
      handleSend(lastSentRef.current);
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* PDF Viewer (left, stacked on top on mobile) */}
      {documentUrl && (
        <div className="flex h-1/2 flex-col border-b md:h-full md:w-1/2 md:border-b-0 md:border-r">
          <div className="flex h-14 shrink-0 items-center border-b px-4">
            <h2 className="truncate text-sm font-medium">{documentName || 'Document'}</h2>
          </div>
          <div className="relative flex-1">
            {!pdfLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-none" />
              </div>
            )}
            <iframe
              src={documentUrl}
              className="h-full w-full"
              title="PDF Viewer"
              onLoad={() => setPdfLoaded(true)}
            />
          </div>
        </div>
      )}

      {/* Chat Panel (right, bottom on mobile) */}
      <div
        className={`flex h-full flex-col ${documentUrl ? 'h-1/2 md:h-full md:w-1/2' : 'w-full'}`}
      >
        <div className="flex h-14 shrink-0 items-center border-b px-4">
          <h2 className="text-sm font-medium">Chat</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Ask a question about your document to get started
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <MessageBubble role="assistant" content="" isLoading />
          )}

          {error && (
            <div className="space-y-2">
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
                <svg
                  className="mr-1.5 h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                  />
                </svg>
                Retry
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
