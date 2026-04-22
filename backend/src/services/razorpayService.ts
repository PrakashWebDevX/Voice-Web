import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from './logger';

// Singleton Razorpay client
let razorpayClient: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (razorpayClient) return razorpayClient;
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return razorpayClient;
}

// ─── Create subscription ─────────────────────────────────────────────────────
export async function createSubscription(userId: string, email: string): Promise<{
  subscriptionId: string;
  shortUrl: string;
}> {
  const rz = getRazorpay();

  const subscription = await (rz.subscriptions as any).create({
    plan_id: process.env.RAZORPAY_PLAN_ID!,
    total_count: 120, // up to 10 years; cancellable anytime
    quantity: 1,
    customer_notify: 1,
    notes: {
      userId,
      email,
    },
    notify_info: {
      notify_phone: '',
      notify_email: email,
    },
  }) as {
    id: string;
    short_url: string;
  };

  logger.info(`Razorpay subscription created: ${subscription.id} for user ${userId}`);

  return {
    subscriptionId: subscription.id,
    shortUrl: subscription.short_url,
  };
}

// ─── Create one-time order (for non-subscription fallback) ────────────────────
export async function createOrder(amountPaise: number, currency: string, userId: string): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const rz = getRazorpay();
  const order = await rz.orders.create({
    amount: amountPaise,
    currency,
    receipt: `vf_${userId}_${Date.now()}`,
    notes: { userId },
  });

  return {
    orderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

// ─── Verify payment signature ─────────────────────────────────────────────────
export function verifyPaymentSignature(params: {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const body = params.razorpay_order_id
    ? `${params.razorpay_order_id}|${params.razorpay_payment_id}`
    : `${params.razorpay_subscription_id}|${params.razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === params.razorpay_signature;
}

// ─── Verify webhook signature ─────────────────────────────────────────────────
export function verifyWebhookSignature(rawBody: string | Buffer, receivedSignature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === receivedSignature;
}

// ─── Cancel subscription ──────────────────────────────────────────────────────
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const rz = getRazorpay();
  await (rz.subscriptions as any).cancel(subscriptionId, { cancel_at_cycle_end: 1 });
  logger.info(`Razorpay subscription cancelled: ${subscriptionId}`);
}
