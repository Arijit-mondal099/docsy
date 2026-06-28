import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: ['3 documents', '50 messages per month', 'Basic AI model'],
    cta: 'Get Started',
    href: '/register',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For power users',
    features: [
      'Unlimited documents',
      'Unlimited messages',
      'GPT-4o + Gemini',
      'Priority support',
    ],
    cta: 'Subscribe',
    href: '/register',
    popular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="container py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free, upgrade when you need more.
        </p>
      </div>
      <div className="mt-16 mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 md:flex-row">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`w-full max-w-sm ${
              plan.popular ? 'border-primary shadow-lg' : ''
            }`}
          >
            <CardHeader>
              {plan.popular && (
                <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Most Popular
                </div>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={plan.href} className="w-full">
                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}