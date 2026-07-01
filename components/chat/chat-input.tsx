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
  const [focused, setFocused] = useState(false);
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

  const hasInput = input.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={cn(
          'flex items-end gap-1.5 rounded-2xl border bg-card px-3 py-2.5 shadow-xs transition-all duration-200',
          focused
            ? 'border-accent/40 shadow-sm ring-2 ring-accent/10'
            : 'border-border/60 hover:border-border',
        )}
      >
        {/* Attach button */}
        <button
          type="button"
          disabled={isLoading}
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors',
            'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50',
            'disabled:opacity-30',
          )}
          title="Attach file"
          tabIndex={-1}
        >
          <Paperclip className="size-4" />
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask a question about your document..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none py-1.5 leading-relaxed"
          style={{ maxHeight: '200px' }}
        />

        {/* Send / Stop button */}
        <button
          type="submit"
          disabled={!hasInput && !isLoading}
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
            isLoading
              ? 'bg-muted text-muted-foreground hover:bg-muted/80'
              : hasInput
                ? 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:shadow-sm'
                : 'text-muted-foreground/30',
          )}
        >
          {isLoading ? (
            <Square className="size-4 fill-current" />
          ) : (
            <ArrowUp className="size-4" />
          )}
          <span className="sr-only">{isLoading ? 'Stop' : 'Send'}</span>
        </button>
      </div>

      {/* Hint — visible when input is empty and not focused */}
      <div
        className={cn(
          'flex justify-center transition-all duration-200',
          !hasInput && !focused ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="mt-2 text-[11px] text-muted-foreground/30 select-none">
          Shift + Enter for new line
        </span>
      </div>
    </form>
  );
}
