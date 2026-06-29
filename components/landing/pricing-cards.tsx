'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type TabId = 'free' | 'monthly' | 'yearly';

const tabs: { id: TabId; label: string }[] = [
  { id: 'free', label: 'Free' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

const plans: Record<
  TabId,
  {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    cta: string;
    href: string;
    badge?: string;
  }
> = {
  free: {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: ['5 documents', '50 messages per month', 'Basic AI model'],
    cta: 'Get Started',
    href: '/register',
  },
  monthly: {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For power users',
    features: ['Unlimited documents', 'Unlimited messages', 'GPT-4o + Gemini', 'Priority support'],
    cta: 'Subscribe',
    href: '/register',
    badge: 'Most Popular',
  },
  yearly: {
    name: 'Pro',
    price: '$190',
    period: '/year',
    description: 'Best value — two months free',
    features: ['Unlimited documents', 'Unlimited messages', 'GPT-4o + Gemini', 'Priority support'],
    cta: 'Subscribe',
    href: '/register',
    badge: 'Save 17%',
  },
};

export function PricingCards() {
  const [activeTab, setActiveTab] = useState<TabId>('free');

  const plan = plans[activeTab];

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="brand" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">Start free, upgrade when you need more.</p>
        </div>

        {/* Tab bar */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex overflow-hidden rounded-full border bg-muted/50 p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan card */}
        <div className="mx-auto flex max-w-xl justify-center">
          <Card
            key={activeTab}
            className="group relative w-full overflow-hidden border-brand shadow-lg ring-1 ring-brand/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand/[0.02]" />
            <CardHeader>
              {plan.badge && (
                <Badge variant="brand" className="mb-2 w-fit">
                  {plan.badge}
                </Badge>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="size-4 shrink-0 text-brand" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={plan.href} className="w-full">
                <Button className="w-full">{plan.cta}</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
