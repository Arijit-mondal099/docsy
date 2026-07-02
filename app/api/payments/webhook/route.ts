import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, subscriptions, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log('Razorpay webhook received:', eventType);

    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment.entity;
        const paymentRecord = await db
          .select()
          .from(payments)
          .where(eq(payments.razorpayOrderId, payment.order_id))
          .then((rows) => rows[0]);

        if (paymentRecord) {
          await db
            .update(payments)
            .set({
              razorpayPaymentId: payment.id,
              status: 'paid',
              updatedAt: new Date(),
            })
            .where(eq(payments.id, paymentRecord.id));
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment.entity;
        const paymentRecord = await db
          .select()
          .from(payments)
          .where(eq(payments.razorpayOrderId, payment.order_id))
          .then((rows) => rows[0]);

        if (paymentRecord) {
          await db
            .update(payments)
            .set({
              razorpayPaymentId: payment.id,
              status: 'failed',
              updatedAt: new Date(),
            })
            .where(eq(payments.id, paymentRecord.id));
        }
        break;
      }

      case 'subscription.activated': {
        const subscription = payload.subscription.entity;
        const planId = subscription.plan_id;

        // Find user by subscription or payment
        const paymentRecord = await db
          .select()
          .from(payments)
          .where(eq(payments.razorpaySubscriptionId, subscription.id))
          .then((rows) => rows[0]);

        if (paymentRecord) {
          // Calculate period end
          const currentPeriodStart = new Date(subscription.current_start * 1000);
          const currentPeriodEnd = new Date(subscription.current_end * 1000);

          // Update or create subscription
          const existingSub = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.razorpaySubscriptionId, subscription.id))
            .then((rows) => rows[0]);

          if (existingSub) {
            await db
              .update(subscriptions)
              .set({
                status: 'active',
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: false,
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, existingSub.id));
          } else {
            await db.insert(subscriptions).values({
              userId: paymentRecord.userId,
              razorpaySubscriptionId: subscription.id,
              razorpayPlanId: planId,
              plan: paymentRecord.plan as 'free' | 'pro_monthly' | 'pro_yearly',
              status: 'active',
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: false,
            });
          }

          // Update user plan
          await db
            .update(user)
            .set({ plan: paymentRecord.plan as 'free' | 'pro_monthly' | 'pro_yearly' })
            .where(eq(user.id, paymentRecord.userId));
        }
        break;
      }

      case 'subscription.cancelled': {
        const subscription = payload.subscription.entity;

        await db
          .update(subscriptions)
          .set({
            status: 'cancelled',
            cancelAtPeriodEnd: true,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.razorpaySubscriptionId, subscription.id));

        // Find user and downgrade to free at period end
        const subRecord = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.razorpaySubscriptionId, subscription.id))
          .then((rows) => rows[0]);

        if (subRecord) {
          // Downgrade will happen at period end via cron or next webhook
        }
        break;
      }

      case 'subscription.completed': {
        const subscription = payload.subscription.entity;

        await db
          .update(subscriptions)
          .set({
            status: 'expired',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.razorpaySubscriptionId, subscription.id));

        // Downgrade user to free
        const subRecord = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.razorpaySubscriptionId, subscription.id))
          .then((rows) => rows[0]);

        if (subRecord) {
          await db.update(user).set({ plan: 'free' }).where(eq(user.id, subRecord.userId));
        }
        break;
      }

      case 'subscription.charged': {
        const subscription = payload.subscription.entity;
        const payment = payload.payment?.entity;

        if (payment) {
          // Record the payment
          const subRecord = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.razorpaySubscriptionId, subscription.id))
            .then((rows) => rows[0]);

          if (subRecord) {
            await db.insert(payments).values({
              userId: subRecord.userId,
              razorpayOrderId: payment.order_id || `order_${payment.id}`,
              razorpayPaymentId: payment.id,
              razorpaySubscriptionId: subscription.id,
              amount: payment.amount,
              currency: payment.currency || 'INR',
              status: 'paid',
              plan: subRecord.plan,
              description: `Subscription renewal - ${subRecord.plan}`,
            });

            // Extend subscription period
            const currentPeriodStart = new Date(subscription.current_start * 1000);
            const currentPeriodEnd = new Date(subscription.current_end * 1000);

            await db
              .update(subscriptions)
              .set({
                currentPeriodStart,
                currentPeriodEnd,
                status: 'active',
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, subRecord.id));
          }
        }
        break;
      }

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
