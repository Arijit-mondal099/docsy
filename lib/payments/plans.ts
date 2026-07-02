export type PlanId = 'free' | 'pro_monthly' | 'pro_yearly';

export interface PlanLimits {
  documentLimit: number;
  messageLimit: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  price: number; // in paise (for INR) or cents (for USD)
  currency: 'INR' | 'USD';
  period: 'month' | 'year' | 'none';
  features: string[];
  limits: PlanLimits;
  razorpayPlanId?: string;
  badge?: string;
  cta: string;
}

// INR prices in paise (1 INR = 100 paise)
export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'INR',
    period: 'none',
    features: ['5 documents', '50 messages per month', 'Basic AI model'],
    limits: {
      documentLimit: 5,
      messageLimit: 50,
    },
    cta: 'Get Started',
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro',
    description: 'For power users',
    price: 1900, // ₹19.00 in paise = ₹1900 (but for testing, use ₹100 = 10000 paise)
    currency: 'INR',
    period: 'month',
    features: ['Unlimited documents', 'Unlimited messages', 'GPT-4o + Gemini', 'Priority support'],
    limits: {
      documentLimit: -1, // -1 = unlimited
      messageLimit: -1,
    },
    badge: 'Most Popular',
    cta: 'Subscribe',
    // razorpayPlanId will be set after creating plan in Razorpay dashboard
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro',
    description: 'Best value — two months free',
    price: 19000, // ₹190.00 in paise = ₹19000 (but for testing, use appropriate amount)
    currency: 'INR',
    period: 'year',
    features: ['Unlimited documents', 'Unlimited messages', 'GPT-4o + Gemini', 'Priority support'],
    limits: {
      documentLimit: -1,
      messageLimit: -1,
    },
    badge: 'Save 17%',
    cta: 'Subscribe',
    // razorpayPlanId will be set after creating plan in Razorpay dashboard
  },
};

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

export function getAllPlans(): Plan[] {
  return Object.values(PLANS);
}

export function getPaidPlans(): Plan[] {
  return Object.values(PLANS).filter((p) => p.id !== 'free');
}

export function getPlanLimits(planId: PlanId): PlanLimits {
  return PLANS[planId].limits;
}

export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

export function getEffectiveLimit(userLimit: number, planLimit: number): number {
  if (isUnlimited(planLimit)) return -1;
  return planLimit;
}
