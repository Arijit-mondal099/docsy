'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { ModelSelector, type ModelOption } from './model-selector';
import { SuggestedQuestions } from './suggested-questions';
import { Button } from '@/components/ui/button';
import { PdfViewer } from '@/components/pdf/pdf-viewer';
import { PanelRightOpen, PanelRightClose, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface ChatPanelProps {
  chatId: string;
  documentId: string;
  documentName?: string;
  initialMessages?: Message[];
}

export function ChatPanel({
  chatId,
  documentId,
  documentName,
  initialMessages = [],
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(true);
  const [model, setModel] = useState<ModelOption>('gpt-4o');
  const pdfUrl = `/api/documents/${documentId}/pdf`;
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
            model,
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
        setMessages((prev) => prev.filter((m) => !(m.role === 'assistant' && m.content === '')));
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, chatId, documentId, model],
  );

  const handleRetry = () => {
    if (lastSentRef.current) {
      handleSend(lastSentRef.current);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* PDF Viewer — left panel, collapsible */}
      {showPdf && (
        <div className="flex h-1/2 flex-col border-b md:h-full md:w-1/2 md:border-b-0 md:border-r">
          <div className="flex shrink-0 items-center justify-between border-b px-3">
            <span className="truncate text-xs font-medium text-muted-foreground">
              {documentName || 'Document'}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowPdf(false)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              title="Hide PDF viewer"
            >
              <PanelRightClose className="h-4 w-4" />
              <span className="sr-only">Hide PDF</span>
            </Button>
          </div>
          <PdfViewer url={pdfUrl} documentName={documentName} className="flex-1" />
        </div>
      )}

      {/* Chat panel — right side */}
      <div className={cn('flex flex-col', showPdf ? 'h-1/2 md:h-full md:w-1/2' : 'h-full w-full')}>
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2 min-w-0">
            {!showPdf && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowPdf(true)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                title="Show PDF viewer"
              >
                <PanelRightOpen className="h-4 w-4" />
                <span className="sr-only">Show PDF</span>
              </Button>
            )}
            <h2 className="truncate text-sm font-medium">Chat</h2>
          </div>
          <ModelSelector value={model} onChange={setModel} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <svg
                  className="h-6 w-6 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <SuggestedQuestions documentName={documentName} onSelect={handleSuggestedQuestion} />
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {isLoading && !error && messages[messages.length - 1]?.role !== 'assistant' && (
            <MessageBubble role="assistant" content="" isLoading />
          )}

          {error && (
            <div className="space-y-2">
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
              <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t px-4 pt-2 pb-3">
          <div className="mx-auto max-w-3xl">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
