'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
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
import { getAllPlans, type Plan } from '@/lib/payments/plans';
import { createPaymentOrder } from '@/lib/api';

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: { description: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Razorpay constructor accepts dynamic options
type RazorpayConstructor = new (options: any) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

type TabId = 'free' | 'monthly' | 'yearly';

const tabMap: Record<TabId, { id: TabId; label: string; planId: Plan['id'] }> = {
  free: { id: 'free', label: 'Free', planId: 'free' },
  monthly: { id: 'monthly', label: 'Monthly', planId: 'pro_monthly' },
  yearly: { id: 'yearly', label: 'Yearly', planId: 'pro_yearly' },
};

const tabs = Object.values(tabMap);

export function PricingCards() {
  const [activeTab, setActiveTab] = useState<TabId>('free');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const currentTab = tabMap[activeTab];
  const plan = getAllPlans().find((p) => p.id === currentTab.planId);

  if (!plan) {
    return null;
  }

  const handleSubscribe = async () => {
    if (!plan || plan.id === 'free') {
      router.push('/register');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createPaymentOrder(plan.id);

      if (!response.orderId) {
        throw new Error('Failed to create payment order');
      }

      // Load Razorpay script dynamically
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      const options = {
        key: response.keyId,
        amount: response.amount,
        currency: response.currency,
        name: 'Docsy',
        description: `${plan.name} - ${plan.period}`,
        order_id: response.orderId,
        handler: async (razorpayResponse: RazorpaySuccessResponse) => {
          try {
            // Verify payment on backend
            await verifyPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            });

            // Redirect to dashboard with success
            router.push('/dashboard?payment=success');
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#0f172a',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: RazorpayErrorResponse) => {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  async function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  }

  async function verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Payment verification failed');
    }
  }

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
              {plan?.badge && (
                <Badge variant="brand" className="mb-2 w-fit">
                  {plan.badge}
                </Badge>
              )}
              <CardTitle className="text-2xl">{plan?.name}</CardTitle>
              <CardDescription>{plan?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  {plan?.currency === 'INR'
                    ? `₹${(plan.price / 100).toFixed(0)}`
                    : `$${(plan.price / 100).toFixed(0)}`}
                </span>
                {plan?.period && <span className="text-muted-foreground">/{plan.period}</span>}
              </div>
              <ul className="space-y-3">
                {plan?.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="size-4 shrink-0 text-brand" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSubscribe} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan?.cta
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
