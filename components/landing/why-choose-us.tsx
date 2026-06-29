import { Zap, Bot, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    stat: '50ms',
    description: 'Average response time. Get answers from your documents in real-time.',
  },
  {
    icon: Bot,
    title: 'Dual AI Models',
    stat: 'GPT-4o + Gemini',
    description: 'Leverage both OpenAI and Google AI for the most accurate answers.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    stat: 'Encrypted',
    description: 'Bank-grade encryption for your documents. We never share your data.',
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="scroll-mt-24 px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="brand" className="mb-4">
            Why Us
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why choose Docsy?</h2>
          <p className="mt-4 text-muted-foreground">
            Built for researchers, lawyers, and students who need answers fast.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-xl border bg-card p-8 text-center ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-xl"
              >
                {/* Top accent bar — scales in on hover */}
                <div className="absolute inset-x-0 top-0 h-0.5 scale-x-0 bg-gradient-to-r from-brand/0 via-brand to-brand/0 transition-transform duration-300 group-hover:scale-x-100" />
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand/20">
                  <Icon className="size-6 text-brand" />
                </div>
                <div className="mb-1 bg-gradient-to-r from-brand to-foreground bg-clip-text text-2xl font-bold text-transparent">
                  {item.stat}
                </div>
                <div className="mb-2 text-sm font-medium text-foreground">{item.title}</div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
