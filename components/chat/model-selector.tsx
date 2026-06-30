'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Cpu, Check, ChevronDown } from 'lucide-react';

export type ModelOption = 'gpt-4o' | 'gemini-2.0-flash';

interface ModelSelectorProps {
  value: ModelOption;
  onChange: (model: ModelOption) => void;
}

const models: { value: ModelOption; label: string; description: string; icon: typeof Sparkles }[] =
  [
    {
      value: 'gpt-4o',
      label: 'GPT-4o',
      description: 'OpenAI — strong general knowledge',
      icon: Sparkles,
    },
    {
      value: 'gemini-2.0-flash',
      label: 'Gemini 2.0 Flash',
      description: 'Google — fast & cost-effective',
      icon: Cpu,
    },
  ];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = models.find((m) => m.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          open && 'ring-1 ring-ring',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selected && <selected.icon className="h-3.5 w-3.5" />}
        <span>{selected?.label || 'Select model'}</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border bg-popover p-1 shadow-lg"
          role="listbox"
        >
          {models.map((model) => {
            const isSelected = model.value === value;
            const Icon = model.icon;
            return (
              <button
                key={model.value}
                onClick={() => {
                  onChange(model.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                role="option"
                aria-selected={isSelected}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{model.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground/70">{model.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
