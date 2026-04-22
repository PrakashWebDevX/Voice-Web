import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import {
  createSubscription,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  cancelSubscription,
} from '../services/razorpayService';
import { User } from '../models/User';
import { cacheDel } from '../services/redisService';
import { logger } from '../services/logger';

const router = Router();

// ─── POST /api/payments/subscribe ───────────────────────────────────────────
// Creates a Razorpay subscription → returns hosted payment link
router.post('/subscribe', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { uid, email } = req.user!;
  try {
    const user = await User.findOne({ uid });
    if (user?.plan === 'pro') {
      res.status(400).json({ error: 'Already on Pro plan' });
      return;
    }
    const { subscriptionId, shortUrl } = await createSubscription(uid, email);
    await User.updateOne({ uid }, { $set: { razorpaySubscriptionId: subscriptionId } });
    res.json({ subscriptionId, paymentUrl: shortUrl });
  } catch (err) {
    logger.error('Subscribe error', err);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// ─── POST /api/payments/order ────────────────────────────────────────────────
// Creates a Razorpay order for checkout modal
router.post('/order', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { uid } = req.user!;
  const amount = Number(process.env.RAZORPAY_PRO_AMOUNT) || 99900;
  const currency = process.env.RAZORPAY_CURRENCY || 'INR';
  try {
    const order = await createOrder(amount, currency, uid);
    res.json({ ...order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    logger.error('Order error', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ─── POST /api/payments/verify ───────────────────────────────────────────────
// Called from frontend after Razorpay checkout succeeds
router.post('/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { uid } = req.user!;
  const { razorpay_payment_id, razorpay_order_id, razorpay_subscription_id, razorpay_signature } = req.body;

  const isValid = verifyPaymentSignature({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_subscription_id,
    razorpay_signature,
  });

  if (!isValid) {
    logger.warn(`Invalid payment signature for user ${uid}`);
    res.status(400).json({ error: 'Invalid payment signature' });
    return;
  }

  try {
    await User.updateOne({ uid }, {
      $set: {
        plan: 'pro',
        generationsLimit: 999999,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySubscriptionId: razorpay_subscription_id || null,
        subscriptionStatus: 'active',
      },
    });
    await cacheDel(`user:${uid}`);
    logger.info(`User ${uid} upgraded to Pro`);
    res.json({ success: true, plan: 'pro' });
  } catch (err) {
    logger.error('Verify update error', err);
    res.status(500).json({ error: 'Failed to activate plan' });
  }
});

// ─── POST /api/payments/cancel ───────────────────────────────────────────────
router.post('/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { uid } = req.user!;
  try {
    const user = await User.findOne({ uid });
    if (!user?.razorpaySubscriptionId) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }
    await cancelSubscription(user.razorpaySubscriptionId);
    await User.updateOne({ uid }, { $set: { subscriptionStatus: 'canceled' } });
    await cacheDel(`user:${uid}`);
    res.json({ message: 'Subscription will cancel at end of billing cycle' });
  } catch (err) {
    logger.error('Cancel error', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ─── POST /api/payments/webhook ─────────────────────────────────────────────
// Raw body required — registered before json() in index.ts
router.post('/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) { res.status(400).json({ error: 'Missing signature' }); return; }

  if (!verifyWebhookSignature(req.body, signature)) {
    logger.warn('Razorpay webhook: invalid signature');
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  let event: { event: string; payload: Record<string, any> };
  try { event = JSON.parse(req.body.toString()); }
  catch { res.status(400).json({ error: 'Malformed body' }); return; }

  logger.info(`Razorpay webhook received: ${event.event}`);

  try {
    switch (event.event) {
      case 'subscription.activated': {
        const sub = event.payload.subscription?.entity;
        const userId = sub?.notes?.userId;
        if (userId) {
          await User.updateOne({ uid: userId }, { $set: { plan: 'pro', generationsLimit: 999999, subscriptionStatus: 'active', razorpaySubscriptionId: sub.id } });
          await cacheDel(`user:${userId}`);
        }
        break;
      }
      case 'payment.captured': {
        const subId = event.payload.payment?.entity?.invoice?.subscription_id;
        if (subId) await User.updateOne({ razorpaySubscriptionId: subId }, { $set: { plan: 'pro', subscriptionStatus: 'active', generationsLimit: 999999 } });
        break;
      }
      case 'subscription.halted':
      case 'subscription.pending': {
        const userId = event.payload.subscription?.entity?.notes?.userId;
        if (userId) { await User.updateOne({ uid: userId }, { $set: { subscriptionStatus: 'past_due' } }); await cacheDel(`user:${userId}`); }
        break;
      }
      case 'subscription.cancelled':
      case 'subscription.completed': {
        const userId = event.payload.subscription?.entity?.notes?.userId;
        if (userId) { await User.updateOne({ uid: userId }, { $set: { plan: 'free', generationsLimit: 5, subscriptionStatus: 'canceled' } }); await cacheDel(`user:${userId}`); }
        break;
      }
      case 'payment.failed': {
        logger.warn(`Payment failed: ${event.payload.payment?.entity?.id}`);
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook processing error', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ─── GET /api/payments/status ────────────────────────────────────────────────
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { uid } = req.user!;
  try {
    const user = await User.findOne({ uid }).select('plan subscriptionStatus generationsUsed generationsLimit razorpaySubscriptionId').lean();
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ plan: user.plan, subscriptionStatus: user.subscriptionStatus, generationsUsed: user.generationsUsed, generationsLimit: user.generationsLimit, hasSubscription: !!user.razorpaySubscriptionId });
  } catch { res.status(500).json({ error: 'Failed to fetch status' }); }
});

export default router;
