import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { payments, subscriptions, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { getPlan, type PlanId } from '@/lib/payments/plans';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Find payment record
    const paymentRecord = await db
      .select()
      .from(payments)
      .where(eq(payments.razorpayOrderId, razorpay_order_id))
      .then((rows) => rows[0]);

    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (paymentRecord.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update payment record
    await db
      .update(payments)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        status: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentRecord.id));

    // If this is a subscription payment, create subscription record
    if (paymentRecord.plan && paymentRecord.plan !== 'free') {
      const plan = getPlan(paymentRecord.plan as PlanId);

      // Calculate subscription period
      const now = new Date();
      const periodEnd = new Date(now);
      if (plan.period === 'month') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else if (plan.period === 'year') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Create subscription
      const [subscription] = await db
        .insert(subscriptions)
        .values({
          userId,
          razorpaySubscriptionId: `sub_${razorpay_payment_id}`,
          razorpayPlanId: plan.razorpayPlanId || '',
          plan: paymentRecord.plan as PlanId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        })
        .returning();

      // Update user plan
      await db
        .update(user)
        .set({ plan: paymentRecord.plan as PlanId })
        .where(eq(user.id, userId));

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
