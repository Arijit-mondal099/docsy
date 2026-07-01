'use client';

import { useState, useRef, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Square, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, []);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={cn(
          'flex items-end gap-1.5 rounded-2xl border bg-card px-3 py-2.5 shadow-xs transition-all',
          'focus-within:border-ring/50 focus-within:ring-1 focus-within:ring-ring/20',
          hasText ? 'border-border' : 'border-border/50',
        )}
      >
        {/* Attach button */}
        <button
          type="button"
          disabled={isLoading}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/40 transition-colors hover:text-muted-foreground hover:bg-muted/60 disabled:opacity-30"
          title="Attach file"
        >
          <Paperclip className="size-4" />
          <span className="sr-only">Attach</span>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your document..."
          disabled={isLoading}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none',
            'scrollbar-thin',
          )}
          style={{ maxHeight: '200px' }}
        />

        {/* Send / Stop button */}
        <button
          type="submit"
          disabled={!hasText || isLoading}
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-all',
            hasText && !isLoading
              ? 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'
              : 'text-muted-foreground/30',
          )}
          aria-label={isLoading ? 'Stop' : 'Send'}
        >
          {isLoading ? (
            <Square className="size-4 fill-current" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </button>
      </div>
    </form>
  );
}
