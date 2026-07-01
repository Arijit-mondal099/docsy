'use client';

import { cn } from '@/lib/utils';
import { Lightbulb, Sparkles, FileSearch, ListChecks } from 'lucide-react';

interface SuggestedQuestionsProps {
  documentName?: string;
  onSelect: (question: string) => void;
  className?: string;
}

const generalQuestions = [
  {
    icon: FileSearch,
    label: 'Summarize the document',
    text: 'Can you provide a detailed summary of this document?',
  },
  {
    icon: ListChecks,
    label: 'Key takeaways',
    text: 'What are the key takeaways and main points from this document?',
  },
  {
    icon: Sparkles,
    label: 'Explain simply',
    text: 'Can you explain the main concepts in simple terms?',
  },
  { icon: Lightbulb, label: 'Ask anything', text: '' },
];

export function SuggestedQuestions({ documentName, onSelect, className }: SuggestedQuestionsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-center text-xs text-muted-foreground/60">
        {documentName
          ? `Ask a question about "${documentName}" to get started`
          : 'Ask a question about your document to get started'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {generalQuestions.map((q) => {
          if (!q.text) return null;
          const Icon = q.icon;
          return (
            <button
              key={q.label}
              onClick={() => onSelect(q.text)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent hover:shadow-sm active:translate-y-px"
            >
              <Icon className="h-3 w-3 shrink-0" />
              {q.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
