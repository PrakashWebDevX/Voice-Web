'use client';

import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: 'free' | 'pro';
  price: string;
  period?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  onCta: () => void;
  loading?: boolean;
  current?: boolean;
}

export default function PricingCard({
  plan,
  price,
  period,
  features,
  cta,
  highlighted,
  onCta,
  loading,
  current,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative rounded-2xl border p-8 flex flex-col',
        highlighted
          ? 'border-acid bg-surface glow-acid'
          : 'border-border bg-surface'
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-acid text-terminal text-xs font-mono font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      {current && (
        <div className="absolute top-4 right-4">
          <span className="bg-surface-3 text-muted text-xs font-mono px-2 py-0.5 rounded-full border border-border">
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {highlighted && <Zap size={16} className="text-acid fill-acid" />}
          <h3 className={cn(
            'font-display font-bold text-xl uppercase tracking-wider',
            highlighted ? 'text-acid' : 'text-white'
          )}>
            {plan}
          </h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display font-bold text-4xl text-white">{price}</span>
          {period && (
            <span className="text-muted font-mono text-sm">/{period}</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm font-mono">
            <Check
              size={14}
              className={cn(
                'mt-0.5 shrink-0',
                highlighted ? 'text-acid' : 'text-subtle'
              )}
            />
            <span className="text-white/70">{feature}</span>
          </li>
        ))}
      </ul>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onCta}
        disabled={loading || current}
        className={cn(
          'w-full py-3 rounded-xl font-mono font-bold text-sm transition-all',
          highlighted
            ? 'bg-acid text-terminal hover:bg-acid-dim glow-acid disabled:opacity-50'
            : 'bg-surface-2 text-white hover:bg-surface-3 border border-border disabled:opacity-50'
        )}
      >
        {loading ? 'Loading…' : current ? 'Current Plan' : cta}
      </motion.button>
    </motion.div>
  );
}
