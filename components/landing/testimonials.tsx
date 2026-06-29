'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Research Scientist',
    initials: 'SC',
    quote:
      'Docsy saved me hours of reading through dense research papers. I can ask questions and get cited answers in seconds.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Law Student',
    initials: 'MJ',
    quote:
      'Being able to query case law documents naturally is a game-changer. The citation feature is incredibly accurate.',
  },
  {
    name: 'Priya Sharma',
    role: 'Product Manager',
    initials: 'PS',
    quote:
      'We use Docsy to analyze competitor whitepapers as a team. The multi-document support is exactly what we needed.',
  },
  {
    name: 'Alex Rivera',
    role: 'Data Analyst',
    initials: 'AR',
    quote:
      'Extracting insights from quarterly reports has never been faster. Docsy pays for itself in time saved.',
  },
];

const gradientColors = [
  'from-brand to-purple-500',
  'from-blue-500 to-brand',
  'from-brand/80 to-blue-600',
  'from-purple-500 to-brand/60',
];

// Duplicate for seamless infinite scroll
const duplicatedList = [...testimonials, ...testimonials];

function TestimonialCard({ t, i }: { t: (typeof testimonials)[number]; i: number }) {
  return (
    <Card className="group relative w-[350px] shrink-0 snap-start overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:w-[400px]">
      {/* Left accent strip matching avatar gradient */}
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${gradientColors[i % testimonials.length]} opacity-60`}
      />
      <CardContent className="flex flex-col gap-4 p-6 pl-7">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${gradientColors[i % testimonials.length]} text-xs font-bold text-white`}
          >
            {t.initials}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </div>
        </div>
        <div className="relative">
          <span
            className="absolute -top-1 -left-1 select-none text-2xl leading-none text-brand/20"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="pl-3 text-sm leading-relaxed italic text-muted-foreground">{t.quote}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  return (
    <section className="overflow-hidden px-4 py-20 md:py-28">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <Badge variant="brand" className="mb-4">
          Testimonials
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Loved by researchers, lawyers, and students
        </h2>
        <p className="mt-4 text-muted-foreground">See what our users are saying about Docsy.</p>
      </div>

      {/* Marquee track — auto-scrolls right to left */}
      <div className="mx-auto max-w-6xl">
        <div
          className="group/track flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          role="list"
          aria-label="Testimonials carousel"
        >
          <div className="flex animate-marquee gap-6 px-3 will-change-transform motion-reduce:animate-none group-hover/track:[animation-play-state:paused]">
            {duplicatedList.map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} t={t} i={i} />
            ))}
          </div>
        </div>
      </div>

      {/* TODO: Replace with real customer quotes before launch */}
    </section>
  );
}
