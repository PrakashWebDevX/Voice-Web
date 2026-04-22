'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Mic, Code2, Download, Globe, Shield, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: <Mic size={20} className="text-acid" />,
    title: 'Voice Input',
    description: 'Speak naturally and watch your words transform into production-ready code in real time.',
  },
  {
    icon: <Zap size={20} className="text-acid" />,
    title: 'AI-Powered Generation',
    description: 'Claude generates complete, working code — not snippets. Full files, all imports, no TODOs.',
  },
  {
    icon: <Code2 size={20} className="text-acid" />,
    title: 'Any Language',
    description: 'HTML, React, Next.js, Express APIs, Python scripts, Arduino sketches — all supported.',
  },
  {
    icon: <Download size={20} className="text-acid" />,
    title: 'Download as ZIP',
    description: 'Export your generated project instantly as a ready-to-run ZIP with README included.',
  },
  {
    icon: <Globe size={20} className="text-acid" />,
    title: 'Real-Time Streaming',
    description: 'Watch code materialize token by token with smooth streaming — no waiting, no loading.',
  },
  {
    icon: <Shield size={20} className="text-acid" />,
    title: 'Saved History',
    description: 'Every generation is saved to your account. Revisit, copy, or explain past code any time.',
  },
];

const SUPPORTED = [
  { label: 'HTML/CSS/JS', color: 'text-orange-400' },
  { label: 'React', color: 'text-blue-400' },
  { label: 'Next.js', color: 'text-white' },
  { label: 'Express', color: 'text-green-400' },
  { label: 'Python', color: 'text-yellow-400' },
  { label: 'Arduino', color: 'text-teal-400' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grid bg-terminal">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4">
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-acid/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-mono text-acid border border-acid/30 bg-acid/10 px-4 py-1.5 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 bg-acid rounded-full animate-pulse" />
            Powered by Claude AI — Streaming Code in Real Time
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-5xl sm:text-7xl leading-none tracking-tight mb-6"
          >
            <span className="text-white">Speak.</span>{' '}
            <span className="text-acid glow-acid-text">Generate.</span>{' '}
            <span className="text-white">Ship.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 font-mono text-lg max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Turn voice or text into complete, production-ready code — websites, APIs, Python scripts,
            Arduino sketches — in seconds with streaming AI generation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-3.5 bg-acid text-terminal rounded-xl font-mono font-bold text-sm hover:bg-acid-dim glow-acid transition-all"
            >
              <Zap size={16} className="fill-terminal" />
              Start Generating — Free
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-8 py-3.5 bg-surface-2 text-white rounded-xl font-mono text-sm border border-border hover:border-border-bright transition-all"
            >
              View Pricing
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Supported languages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mt-12 flex-wrap"
          >
            <span className="text-xs font-mono text-subtle mr-2">Generates:</span>
            {SUPPORTED.map((lang) => (
              <span
                key={lang.label}
                className={`text-xs font-mono px-2.5 py-1 bg-surface-2 border border-border rounded ${lang.color}`}
              >
                {lang.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Terminal demo */}
      <section className="px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-mono text-muted ml-2">voiceforge — live demo</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <div className="text-muted">$ voiceforge generate --type html-website</div>
              <div className="text-white/60">▶ Listening for voice input…</div>
              <div className="text-acid">&gt; "Create a dark-themed portfolio site with animated hero"</div>
              <div className="text-white/60">▶ Streaming generation…</div>
              <div className="text-white/80 space-y-1 mt-2">
                <div><span className="text-acid">{'<'}</span><span className="text-blue-400">html</span><span className="text-acid">{'>'}</span></div>
                <div className="pl-4"><span className="text-acid">{'<'}</span><span className="text-blue-400">head</span><span className="text-acid">{'>'}</span></div>
                <div className="pl-8 text-yellow-400">{'<title>Alex Portfolio</title>'}</div>
                <div className="pl-8 text-subtle">{'// ... animations, responsive layout, dark theme'}</div>
                <div className="text-acid animate-pulse">█</div>
              </div>
              <div className="text-acid text-xs mt-4">✓ Generated 342 lines in 3.2s — 4,891 tokens</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Everything you need to{' '}
              <span className="text-acid">ship faster</span>
            </h2>
            <p className="text-muted font-mono max-w-xl mx-auto">
              From voice input to production-ready ZIP in seconds.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="bg-surface border border-border hover:border-acid/30 rounded-2xl p-6 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center mb-4 group-hover:glow-acid transition-all">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-muted font-mono text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-surface border border-acid/30 rounded-3xl p-12 glow-acid"
        >
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Ready to build at the speed of thought?
          </h2>
          <p className="text-muted font-mono mb-8">
            5 free generations. No credit card required.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-acid text-terminal rounded-xl font-mono font-bold text-sm hover:bg-acid-dim transition-all glow-acid"
          >
            <Zap size={16} className="fill-terminal" />
            Get Started Free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-muted">
          <span>© 2024 VoiceForge</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-acid rounded-full" />
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
