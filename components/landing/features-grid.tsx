import type { ComponentType } from 'react';
import { Upload, MessageSquare, FileSearch, FolderOpen, History, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type FeatureVariant = 'hero' | 'wide' | 'normal';

const features: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  span: string;
  variant: FeatureVariant;
}[] = [
  {
    icon: Upload,
    title: 'PDF Upload',
    description:
      'Drag and drop any PDF up to 10MB. We parse, chunk, and index it automatically. Your documents are converted into searchable embeddings in seconds.',
    span: 'md:col-span-3',
    variant: 'hero',
  },
  {
    icon: MessageSquare,
    title: 'AI-Powered Q&A',
    description: 'Ask questions and get accurate answers powered by GPT-4o and Gemini.',
    span: '',
    variant: 'normal',
  },
  {
    icon: FileSearch,
    title: 'Smart Citations',
    description: 'Answers include references to the exact pages and sections in your document.',
    span: '',
    variant: 'normal',
  },
  {
    icon: FolderOpen,
    title: 'Multi-Document',
    description: 'Upload multiple PDFs and switch between them seamlessly.',
    span: '',
    variant: 'normal',
  },
  {
    icon: History,
    title: 'Chat History',
    description: 'All your conversations are saved. Pick up where you left off anytime.',
    span: 'md:col-span-2',
    variant: 'wide',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'End-to-end encryption. Your data never leaves our secure infrastructure.',
    span: '',
    variant: 'normal',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="brand" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to understand your documents
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features designed to help you extract knowledge from PDFs in seconds.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isHero = feature.variant === 'hero';
            const isWide = feature.variant === 'wide';

            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-xl border bg-card ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl ${feature.span} ${isHero ? 'flex items-center gap-8 p-8 md:p-10' : 'p-6'}`}
              >
                {/* Top accent bar — scales in on hover */}
                <div className="absolute inset-x-0 top-0 h-0.5 scale-x-0 bg-gradient-to-r from-brand/0 via-brand to-brand/0 transition-transform duration-300 group-hover:scale-x-100" />

                {isHero ? (
                  <>
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand/20">
                      <Icon className="size-8 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="mb-2 text-xl font-bold text-foreground md:text-2xl">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`mb-3 flex items-center justify-center rounded-lg bg-brand/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand/20 ${isWide ? 'size-12' : 'size-10'}`}
                    >
                      <Icon className={`text-brand ${isWide ? 'size-6' : 'size-5'}`} />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
