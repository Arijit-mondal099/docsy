'use client';

import { cn } from '@/lib/utils';

const placeholderTextLines = [
  { width: 'w-full', bold: true },
  { width: 'w-3/4' },
  { width: 'w-5/6' },
  { width: 'w-2/3' },
  { width: 'w-full' },
  { width: 'w-4/5' },
  { width: 'w-3/4' },
  { width: 'w-5/6' },
  { width: 'w-1/2' },
  { width: 'w-full' },
  { width: 'w-3/5' },
  { width: 'w-4/5' },
  { width: 'w-full' },
  { width: 'w-2/3' },
  { width: 'w-5/6' },
  { width: 'w-3/4' },
  { width: 'w-full' },
  { width: 'w-4/5' },
];

export function DashboardMockup() {
  return (
    <div className="w-full overflow-hidden rounded-xl border shadow-xl ring-1 ring-foreground/5 bg-card transition-all duration-300 hover:shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-yellow-400" />
          <div className="size-2.5 rounded-full bg-green-400" />
        </div>
        <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-muted px-3">
          <span className="text-[10px] text-muted-foreground">
            docsy.app/documents/research-paper
          </span>
        </div>
        <div className="w-[52px]" />
      </div>

      {/* Split view */}
      <div className="flex flex-col md:flex-row md:min-h-[520px]">
        {/* PDF preview panel */}
        <div className="flex flex-col border-b md:w-[35%] md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">research-paper.pdf</span>
            <span className="text-[10px] text-muted-foreground">3 / 12</span>
          </div>
          <div className="flex-1 space-y-2.5 bg-muted/30 p-4">
            <div className="mb-3 h-1 w-12 rounded-full bg-brand/20" />
            {placeholderTextLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 rounded bg-muted-foreground/15',
                  line.width,
                  line.bold && 'h-2.5 bg-muted-foreground/25',
                )}
              />
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2 border-b px-3 py-1.5">
            <div className="flex size-5 items-center justify-center rounded-full bg-brand/20">
              <div className="size-2 rounded-full bg-brand" />
            </div>
            <span className="text-xs font-medium">Chat with Document</span>
          </div>

          <div className="flex flex-1 flex-col gap-3 p-4">
            {/* User message */}
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2">
              <p className="text-xs text-primary-foreground">
                What are the key findings about climate change in this paper?
              </p>
            </div>

            {/* AI message */}
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-brand/10 px-3.5 py-2">
              <p className="text-xs text-foreground">
                The paper identifies three key findings regarding climate change impacts:
              </p>
              <div className="mt-1.5 space-y-1">
                <div className="h-1.5 w-full rounded bg-foreground/10" />
                <div className="h-1.5 w-4/5 rounded bg-foreground/10" />
                <div className="h-1.5 w-3/5 rounded bg-foreground/10" />
              </div>
              <p className="mt-1 text-[10px] text-brand">Source: Page 4, Paragraph 2</p>
            </div>

            {/* User message 2 */}
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2">
              <p className="text-xs text-primary-foreground">Summarize the methodology used.</p>
            </div>

            {/* AI message 2 */}
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-brand/10 px-3.5 py-2">
              <p className="text-xs text-foreground">
                The study employed a mixed-methods approach combining quantitative surveys with
                qualitative interviews across 500 participants over a 12-month period.
              </p>
              <p className="mt-1 text-[10px] text-brand">Source: Page 7, Section 3.1</p>
            </div>

            {/* Typing indicator */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex size-5 items-center justify-center rounded-full bg-brand/20">
                <div className="size-2 rounded-full bg-brand" />
              </div>
              <div className="flex gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
              </div>
            </div>

            {/* Input bar */}
            <div className="mt-auto flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-2">
              <span className="text-xs text-muted-foreground">
                Ask a question about your document...
              </span>
              <div className="ml-auto flex size-6 items-center justify-center rounded-full bg-brand">
                <svg
                  className="size-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
