import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="group relative mx-auto max-w-5xl overflow-hidden rounded-2xl border ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
        {/* Background image — anchored to bottom */}
        <Image
          src="/cta-bg.jpg"
          alt=""
          fill
          className="object-cover object-bottom opacity-20"
          priority
          unoptimized
          aria-hidden
        />
        {/* Content on top */}
        <div className="relative z-10 px-12 py-20 text-center md:px-16 md:py-28">
          {/* Subtle glow accent */}
          <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/5 blur-3xl transition-opacity duration-300 group-hover:opacity-70" />
          <h2 className="relative text-3xl font-bold tracking-tight md:text-4xl">
            Ready to transform how you read?
          </h2>
          <p className="relative mt-4 text-lg text-muted-foreground">
            Upload your first PDF free. No credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="relative mt-8 h-12 px-8 text-base">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
