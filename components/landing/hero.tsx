'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/components/auth/auth-context';
import { DashboardMockup } from './dashboard-mockup';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { openSignUp } = useAuthModal();

  useEffect(() => {
    const section = sectionRef.current;
    const dashboard = dashboardRef.current;
    if (!section || !dashboard) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = section.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // How far the bottom of the section is past the bottom 10% line of the viewport
          const sectionBottom = rect.bottom;
          const triggerLine = viewportHeight * 0.9;
          const scrollProgress = Math.max(0, triggerLine - sectionBottom);

          // Map scroll progress to scale: 1.0 → 1.08 over ~200px of scroll
          const maxScroll = 200;
          const progress = Math.min(scrollProgress / maxScroll, 1);
          const newScale = 1 + progress * 0.08;

          dashboard.style.transform = `scale(${newScale})`;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative px-4 pt-12 pb-16 text-center md:pt-16 md:pb-24">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-brand" />
          AI-powered document conversations
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Chat with your{' '}
          <span className="bg-gradient-to-r from-foreground via-brand to-foreground bg-clip-text text-transparent">
            PDFs
          </span>{' '}
          using{' '}
          <span className="bg-gradient-to-r from-foreground via-brand to-foreground bg-clip-text text-transparent">
            AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          Upload a PDF. Ask questions. Get instant answers with citations from GPT-4o and Gemini. No
          credit card required.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="h-11 px-6 text-base" onClick={openSignUp}>
            Get Started Free
          </Button>
          <Link href="#features">
            <Button variant="outline" size="lg" className="h-11 px-6 text-base">
              See how it works
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">GPT-4o</span>
            <span className="hidden sm:inline">&amp; Gemini</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">50ms</span>
            <span>avg. response</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">End-to-end</span>
            <span>encrypted</span>
          </div>
        </div>

        {/* Dashboard mockup — scales up on scroll */}
        <div
          ref={dashboardRef}
          className="relative mt-12 mx-auto w-full md:max-w-4xl md:origin-top md:overflow-hidden md:rounded-xl md:bg-red-500/20 will-change-transform"
        >
          {/* Image covering entire container (including padding area) — hidden on mobile */}
          <Image
            src="/hero.jpg"
            alt=""
            fill
            className="hidden object-cover opacity-70 md:block"
            priority
            unoptimized
            aria-hidden
          />
          {/* Dashboard mockup on top with padding — no padding on mobile */}
          <div className="relative z-10 p-0 md:p-6">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
