'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, IndianRupee } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';
import PricingCard from '@/components/PricingCard';
import toast from 'react-hot-toast';

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const FREE_FEATURES = [
  '5 code generations total',
  'All 7 code types supported',
  'Syntax-highlighted output',
  'Copy & download as ZIP',
  'Generation history',
  'Explain Code feature',
];

const PRO_FEATURES = [
  'Unlimited generations',
  'All 7 code types supported',
  'Real-time streaming output',
  'Priority Claude AI access',
  'Full generation history',
  'Explain Code feature',
  'Download as ZIP',
  'UPI, Cards, NetBanking via Razorpay',
  'Cancel anytime',
];

export default function PricingPage() {
  const { user, profile, getToken, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isPro = profile?.plan === 'pro';

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load Razorpay. Check your internet connection.');
        setLoading(false);
        return;
      }

      const token = await getToken();

      // Check if subscription plan exists — if so, use subscription flow
      const planId = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID;

      if (planId) {
        // ── Subscription flow ─────────────────────────────────
        const data = await apiClient<{ subscriptionId: string; paymentUrl: string }>(
          '/payments/subscribe',
          { method: 'POST', token }
        );
        // Redirect to Razorpay hosted page
        window.location.href = data.paymentUrl;
        return;
      }

      // ── One-time order flow (checkout modal) ──────────────────
      const order = await apiClient<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>('/payments/order', { method: 'POST', token });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'VoiceForge',
        description: 'Pro Plan — Unlimited Code Generation',
        image: '/logo.png',
        order_id: order.orderId,
        prefill: {
          email: user.email || '',
          name: user.displayName || '',
        },
        theme: { color: '#39FF14', backdrop_color: '#0a0a0a' },
        modal: { escape: true, backdropclose: false },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyToken = await getToken();
            await apiClient('/payments/verify', {
              method: 'POST',
              token: verifyToken,
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            await refreshProfile();
            toast.success('🎉 Pro activated! Unlimited generations unlocked.');
            router.push('/dashboard?upgraded=true');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast.error(`Payment failed: ${resp.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel subscription? You keep Pro until end of billing cycle.')) return;
    setLoading(true);
    try {
      const token = await getToken();
      await apiClient('/payments/cancel', { method: 'POST', token });
      await refreshProfile();
      toast.success('Subscription cancelled. Active until billing cycle ends.');
    } catch {
      toast.error('Failed to cancel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal bg-grid">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-display font-bold text-5xl text-white mb-4">
            Simple <span className="text-acid glow-acid-text">Pricing</span>
          </h1>
          <p className="text-muted font-mono text-lg max-w-md mx-auto">
            Start free. Upgrade when you're ready to build without limits.
          </p>
        </motion.div>

        {/* Payment badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-4 mb-12 flex-wrap"
        >
          {['UPI', 'Cards', 'NetBanking', 'Wallets', 'EMI'].map((method) => (
            <span key={method} className="text-xs font-mono px-3 py-1.5 bg-surface border border-border rounded-full text-muted flex items-center gap-1.5">
              <IndianRupee size={10} className="text-acid" />
              {method}
            </span>
          ))}
          <span className="text-xs font-mono px-3 py-1.5 bg-surface border border-acid/30 rounded-full text-acid flex items-center gap-1.5">
            <ShieldCheck size={10} />
            Secured by Razorpay
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <PricingCard
            plan="free"
            price="₹0"
            features={FREE_FEATURES}
            cta="Start Free"
            onCta={() => router.push('/dashboard')}
            current={!isPro && !!user}
          />
          <PricingCard
            plan="pro"
            price="₹999"
            period="month"
            features={PRO_FEATURES}
            cta={isPro ? 'Manage Plan' : 'Upgrade to Pro'}
            highlighted
            onCta={isPro ? handleCancel : handleUpgrade}
            loading={loading}
            current={isPro}
          />
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 space-y-4 max-w-xl mx-auto"
        >
          <h2 className="font-display font-bold text-xl text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          {[
            {
              q: 'Which payment methods are supported?',
              a: 'All major Indian payment methods via Razorpay: UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, EMI, and Wallets.',
            },
            {
              q: 'What counts as a generation?',
              a: 'Each prompt submission = one generation. Pro users have no limit.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel from the pricing page. You keep Pro access until end of your billing period.',
            },
            {
              q: 'Is my payment secure?',
              a: 'All payments are processed by Razorpay (PCI DSS Level 1 certified). We never store your card details.',
            },
          ].map((item) => (
            <div key={item.q} className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-mono font-semibold text-white text-sm mb-2">{item.q}</h3>
              <p className="font-mono text-muted text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
