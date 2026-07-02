import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { user, payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { createOrder, createCustomer, getEnv } from '@/lib/payments/razorpay';
import { getPlan, type PlanId } from '@/lib/payments/plans';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { planId } = body as { planId: PlanId };

    if (!planId || !['pro_monthly', 'pro_yearly'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const plan = getPlan(planId);
    const userRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .then((rows) => rows[0]);

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or get Razorpay customer
    let customerId = userRecord.razorpayCustomerId;
    if (!customerId) {
      const customer = await createCustomer(
        userRecord.name || 'User',
        userRecord.email,
        undefined, // contact - optional
      );
      customerId = customer.id;
      await db.update(user).set({ razorpayCustomerId: customerId }).where(eq(user.id, userId));
    }

    // Generate a short unique receipt (Razorpay limit: 40 chars)
    const shortId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const receipt = `ord_${shortId}`;

    // Create Razorpay order
    const order = await createOrder({
      amount: plan.price,
      currency: plan.currency,
      receipt,
      notes: {
        userId,
        planId,
        planName: plan.name,
      },
    });

    // Create payment record in DB
    await db.insert(payments).values({
      userId,
      razorpayOrderId: order.id,
      amount: plan.price,
      currency: plan.currency,
      status: 'created',
      plan: planId,
      description: `${plan.name} subscription`,
    });

    const env = getEnv();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        period: plan.period,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
