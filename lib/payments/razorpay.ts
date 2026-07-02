import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getEnv } from '@/lib/env';

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const env = getEnv();
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

export { getEnv };

export interface CreateOrderParams {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  planId: string;
  customerId?: string;
  totalCount?: number;
  quantity?: number;
  customerNotify?: boolean;
  startAt?: number;
}

export async function createOrder(params: CreateOrderParams) {
  const rzp = getRazorpay();
  return rzp.orders.create({
    amount: params.amount,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes,
  });
}

export async function createSubscription(params: CreateSubscriptionParams) {
  const rzp = getRazorpay();
  return rzp.subscriptions.create({
    plan_id: params.planId,
    customer_id: params.customerId,
    total_count: params.totalCount ?? 12,
    quantity: params.quantity ?? 1,
    customer_notify: params.customerNotify ?? true,
    start_at: params.startAt,
  } as Record<string, unknown>);
}

export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
  const rzp = getRazorpay();
  return rzp.subscriptions.cancel(subscriptionId, cancelAtPeriodEnd);
}

export async function fetchSubscription(subscriptionId: string) {
  const rzp = getRazorpay();
  return rzp.subscriptions.fetch(subscriptionId);
}

export async function fetchPayment(paymentId: string) {
  const rzp = getRazorpay();
  return rzp.payments.fetch(paymentId);
}

export async function createCustomer(name: string, email: string, contact?: string) {
  const rzp = getRazorpay();
  return rzp.customers.create({
    name,
    email,
    contact,
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const env = getEnv();
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expectedSignature === signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const env = getEnv();
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export interface RazorpayPlan {
  id: string;
  item: {
    name: string;
    amount: number;
    currency: string;
    description: string;
  };
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
}

export async function createPlan(plan: RazorpayPlan) {
  const rzp = getRazorpay();
  return rzp.plans.create(plan);
}

export async function fetchPlan(planId: string) {
  const rzp = getRazorpay();
  return rzp.plans.fetch(planId);
}
