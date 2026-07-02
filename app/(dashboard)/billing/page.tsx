'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchUsage } from '@/lib/api';
import {
  fetchSubscription,
  cancelSubscription,
  fetchPaymentHistory,
  createPaymentOrder,
} from '@/lib/api';
import { getAllPlans } from '@/lib/payments/plans';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, CreditCard, Calendar, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  error?: { description: string };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayResponse) => void) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Razorpay constructor accepts dynamic options
type RazorpayConstructor = new (options: any) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

const planTabs = [
  { id: 'pro_monthly', label: 'Monthly' },
  { id: 'pro_yearly', label: 'Yearly' },
] as const;

export default function BillingPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<'pro_monthly' | 'pro_yearly'>('pro_monthly');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const { data: usageStats, isLoading: usageLoading } = useQuery({
    queryKey: ['usage'],
    queryFn: fetchUsage,
    refetchInterval: 30_000,
  });

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });

  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => fetchPaymentHistory(1, 10),
  });

  const currentPlan = subscription?.plan || 'free';
  const planDetails = getAllPlans().find((p) => p.id === currentPlan);
  const selectedPlan = getAllPlans().find((p) => p.id === selectedPlanId);

  async function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  }

  async function handleUpgrade() {
    if (!selectedPlan) return;
    setIsCheckingOut(true);

    try {
      const response = await createPaymentOrder(selectedPlan.id);

      if (!response.orderId || !response.keyId) {
        throw new Error('Failed to create payment order');
      }

      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      const options = {
        key: response.keyId,
        amount: response.amount,
        currency: response.currency,
        name: 'Docsy',
        description: `${selectedPlan.name} - ${selectedPlan.period}`,
        order_id: response.orderId,
        handler: async (razorpayResponse: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error || 'Payment verification failed');
            }

            router.refresh();
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
            setIsCheckingOut(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: RazorpayResponse) => {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setIsCheckingOut(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsCheckingOut(false);
    }
  }

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will lose Pro features at the end of the billing period.',
      )
    ) {
      return;
    }

    try {
      await cancelSubscription();
      router.refresh();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  if (usageLoading || subLoading || historyLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing details</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-40 animate-pulse">
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isPro = currentPlan !== 'free';
  const subscriptionData = subscription as Subscription | null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-brand/20 bg-brand/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {planDetails?.name || 'Free'} Plan
                {planDetails?.badge && (
                  <Badge variant="brand" className="ml-2">
                    {planDetails.badge}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isPro
                  ? `Your subscription is ${subscriptionData?.status === 'active' ? 'active' : subscriptionData?.status}.`
                  : 'Upgrade to Pro for unlimited access.'}
              </CardDescription>
            </div>
            {isPro && subscriptionData?.status === 'active' && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-semibold">{planDetails?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/10 text-emerald-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isPro ? 'Renews on' : 'Reset date'}
                </p>
                <p className="font-semibold">
                  {isPro && subscriptionData?.currentPeriodEnd
                    ? format(new Date(subscriptionData.currentPeriodEnd), 'MMM d, yyyy')
                    : usageStats?.resetDate
                      ? format(new Date(usageStats.resetDate), 'MMM d, yyyy')
                      : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber/10 text-amber-600">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                <p className="font-semibold">{isPro ? planDetails?.period : 'Monthly'}</p>
              </div>
            </div>
          </div>

          {isPro && subscriptionData && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">Subscription Status</p>
                <p className="text-sm text-muted-foreground">
                  {subscriptionData.cancelAtPeriodEnd
                    ? `Will cancel on ${format(new Date(subscriptionData.currentPeriodEnd), 'MMM d, yyyy')}`
                    : 'Auto-renews each billing period'}
                </p>
              </div>
              {subscriptionData.cancelAtPeriodEnd ? (
                <Button variant="outline" onClick={handleUpgrade}>
                  Reactivate
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              )}
            </div>
          )}

          {!isPro && selectedPlan && (
            <div className="mt-6">
              {/* Plan selector tabs */}
              <div className="mb-4 flex justify-center">
                <div className="inline-flex overflow-hidden rounded-full border bg-muted/50 p-0.5">
                  {planTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedPlanId(tab.id)}
                      className={`relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                        selectedPlanId === tab.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                      {tab.id === 'pro_yearly' && (
                        <span className="ml-1 text-xs text-emerald-600 font-semibold">
                          Save 17%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price display */}
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">
                  {selectedPlan.currency === 'INR'
                    ? `₹${(selectedPlan.price / 100).toFixed(0)}`
                    : `$${(selectedPlan.price / 100).toFixed(0)}`}
                </span>
                <span className="text-muted-foreground">/{selectedPlan.period}</span>
              </div>

              <Button onClick={handleUpgrade} className="w-full" size="lg" disabled={isCheckingOut}>
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Pro'
                )}
              </Button>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Get unlimited documents, messages, and premium AI models
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
          <CardDescription>Your current usage and limits based on your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium tabular-nums">
                  {usageStats?.documentsUploaded} /{' '}
                  {usageStats?.documentLimit === -1 ? 'Unlimited' : usageStats?.documentLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width:
                      usageStats && usageStats.documentLimit !== -1
                        ? `${Math.min((usageStats.documentsUploaded / usageStats.documentLimit) * 100, 100)}%`
                        : '0%',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium tabular-nums">
                  {usageStats?.messagesSent} /{' '}
                  {usageStats?.messageLimit === -1 ? 'Unlimited' : usageStats?.messageLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width:
                      usageStats && usageStats.messageLimit !== -1
                        ? `${Math.min((usageStats.messagesSent / usageStats.messageLimit) * 100, 100)}%`
                        : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory?.payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">No payments yet</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory?.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{payment.description || 'Subscription payment'}</TableCell>
                      <TableCell>
                        {payment.plan
                          ? getAllPlans().find((p) => p.id === payment.plan)?.name || payment.plan
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {payment.currency === 'INR'
                          ? `₹${(payment.amount / 100).toFixed(2)}`
                          : `$${(payment.amount / 100).toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'paid'
                              ? 'default'
                              : payment.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>See what features are included in each plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  {getAllPlans().map((plan) => (
                    <TableHead key={plan.id} className="text-center">
                      {plan.name}
                      {plan.badge && (
                        <Badge variant="brand" className="ml-1 block mt-1">
                          {plan.badge}
                        </Badge>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Monthly Price</TableCell>
                  {getAllPlans().map((plan) => (
                    <TableCell key={plan.id} className="text-center font-medium">
                      {plan.price === 0
                        ? 'Free'
                        : plan.currency === 'INR'
                          ? `₹${(plan.price / 100).toFixed(0)}`
                          : `$${(plan.price / 100).toFixed(0)}`}
                      {plan.period !== 'none' && (
                        <span className="text-muted-foreground text-sm">/{plan.period}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Documents</TableCell>
                  {getAllPlans().map((plan) => (
                    <TableCell key={plan.id} className="text-center">
                      {plan.limits.documentLimit === -1 ? 'Unlimited' : plan.limits.documentLimit}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Messages/Month</TableCell>
                  {getAllPlans().map((plan) => (
                    <TableCell key={plan.id} className="text-center">
                      {plan.limits.messageLimit === -1 ? 'Unlimited' : plan.limits.messageLimit}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">AI Models</TableCell>
                  <TableCell className="text-center">Basic</TableCell>
                  <TableCell className="text-center">GPT-4o + Gemini</TableCell>
                  <TableCell className="text-center">GPT-4o + Gemini</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Priority Support</TableCell>
                  <TableCell className="text-center">—</TableCell>
                  <TableCell className="text-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
                  </TableCell>
                  <TableCell className="text-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mx-auto" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
