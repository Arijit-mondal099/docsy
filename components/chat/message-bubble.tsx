'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './markdown-renderer';
import { ThumbsUp, ThumbsDown, Copy, Check, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground ring-1 ring-border">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function AiAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground ring-1 ring-accent/30">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
    </span>
  );
}

export function MessageBubble({ role, content, isLoading }: MessageBubbleProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {isUser ? <UserAvatar /> : <AiAvatar />}

      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        {/* Message content */}
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
          )}
        >
          {isLoading ? (
            <LoadingDots />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>

        {/* Actions — feedback + copy for assistant messages */}
        {!isUser && !isLoading && content && (
          <div className="mt-1 flex items-center gap-1 px-2">
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground',
                feedback === 'up' && 'text-accent',
              )}
              aria-label="Thumbs up"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground',
                feedback === 'down' && 'text-destructive',
              )}
              aria-label="Thumbs down"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-foreground"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
