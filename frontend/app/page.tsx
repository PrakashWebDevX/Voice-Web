'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Mic, Code2, Download, Globe, Shield, ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Canvas3D to avoid SSR issues with Three.js
const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false });

const FEATURES = [
  {
    icon: <BrainCircuit size={24} className="text-acid" />,
    title: 'Neural Architecture',
    description: 'Powered by state-of-the-art LLMs designed specifically for complex code generation.',
  },
  {
    icon: <Zap size={24} className="text-acid" />,
    title: 'Instant Execution',
    description: 'Transform your spoken words into production-ready repositories in milliseconds.',
  },
  {
    icon: <Code2 size={24} className="text-acid" />,
    title: 'Universal Polyglot',
    description: 'From React and Next.js to Python and Rust. If it can be compiled, it can be generated.',
  },
  {
    icon: <Globe size={24} className="text-acid" />,
    title: 'Real-Time Streaming',
    description: 'Watch your infrastructure materialize token by token. No waiting. No loading screens.',
  },
  {
    icon: <Shield size={24} className="text-acid" />,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption for all your generated IP. Your code belongs to you.',
  },
  {
    icon: <Sparkles size={24} className="text-acid" />,
    title: 'Pixel Perfect UI',
    description: 'Generates gorgeous, responsive, and accessible interfaces out of the box.',
  },
];

const SUPPORTED = [
  { label: 'Next.js', color: 'text-white border-white/20' },
  { label: 'React', color: 'text-blue-400 border-blue-400/20' },
  { label: 'Python', color: 'text-yellow-400 border-yellow-400/20' },
  { label: 'TypeScript', color: 'text-blue-500 border-blue-500/20' },
  { label: 'Rust', color: 'text-orange-500 border-orange-500/20' },
  { label: 'Go', color: 'text-cyan-400 border-cyan-400/20' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-terminal text-white selection:bg-acid selection:text-black overflow-hidden font-body">
      {/* 3D Background */}
      <Canvas3D />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-20 px-4">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-acid/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-xs font-mono text-acid border border-acid/30 bg-acid/10 px-5 py-2 rounded-full mb-12 backdrop-blur-md"
          >
            <span className="w-2 h-2 bg-acid rounded-full animate-pulse-acid" />
            VoiceForge Engine v2.0 Online
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter mb-8"
          >
            <span className="block text-white/90">SPEAK.</span>
            <span className="block text-acid drop-shadow-[0_0_30px_rgba(57,255,20,0.4)]">GENERATE.</span>
            <span className="block text-white/90">DOMINATE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-white/50 font-mono text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
          >
            The world's most powerful AI development environment. Transform natural language into complex, production-ready codebases in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/dashboard"
              className="group relative flex items-center gap-3 px-10 py-5 bg-acid text-black rounded-2xl font-mono font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Zap size={20} className="fill-black relative z-10" />
              <span className="relative z-10">Initialize Engine</span>
            </Link>
            
            <Link
              href="/pricing"
              className="group flex items-center gap-3 px-10 py-5 bg-white/5 backdrop-blur-md text-white rounded-2xl font-mono text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <span>View Capabilities</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Supported Languages Ribbon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center"
          >
            <span className="text-xs font-mono text-white/40 mb-6 uppercase tracking-widest">Supported Architectures</span>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {SUPPORTED.map((lang, i) => (
                <motion.span
                  key={lang.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className={`text-sm font-mono px-4 py-2 bg-black/50 backdrop-blur-xl border rounded-lg ${lang.color} shadow-2xl`}
                >
                  {lang.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terminal Demo Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
            className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.05)] relative"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <span className="text-xs font-mono text-white/30 tracking-widest">root@voiceforge:~</span>
            </div>
            
            {/* Terminal Content */}
            <div className="p-8 font-mono text-[15px] leading-relaxed space-y-4">
              <div className="flex items-center text-white/50">
                <span className="text-acid mr-4">❯</span>
                <span>voiceforge init --engine claude-3-opus</span>
              </div>
              <div className="text-blue-400">Initializing neural pathways... [OK]</div>
              
              <div className="flex items-start text-white/50 mt-6">
                <span className="text-acid mr-4">❯</span>
                <span className="text-white/80">"Build a real-time multiplayer dashboard with WebSockets and a dark glassmorphism UI."</span>
              </div>
              
              <div className="space-y-2 mt-4 text-white/60">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-acid border-t-transparent rounded-full animate-spin" />
                  Synthesizing architecture...
                </div>
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: 'auto', opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1.5 }}
                  className="pl-7 text-acid/80 overflow-hidden"
                >
                  <pre className="font-mono text-sm bg-black/50 p-4 rounded-xl border border-acid/20 mt-2">
{`import { Server } from 'socket.io';
import { useEffect, useState } from 'react';

// Generative UI Components streaming...
export default function Dashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const socket = io('ws://api.voiceforge.dev');
    socket.on('stream', setData);
  }, []);

  return (
    <GlassContainer>
      <RealTimeMetrics data={data} />
    </GlassContainer>
  );
}`}
                  </pre>
                </motion.div>
              </div>
              <div className="text-acid text-sm mt-6 flex items-center gap-2">
                <Zap size={14} className="fill-acid" />
                <span>Payload generated in 1.24s (8,432 tokens)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Features Section */}
      <section className="relative z-10 py-32 px-4 bg-black/50 backdrop-blur-3xl border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="font-display font-black text-5xl md:text-7xl text-white mb-6 tracking-tight">
              Unrivaled <span className="text-acid drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]">Power.</span>
            </h2>
            <p className="text-white/40 font-mono text-lg max-w-2xl mx-auto">
              A paradigm shift in software development. Experience the raw throughput of AI-native engineering.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="group relative bg-white/[0.02] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors overflow-hidden"
              >
                {/* Hover Glow effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-acid/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 shadow-xl group-hover:border-acid/50 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="relative z-10 font-display font-bold text-2xl text-white mb-4 group-hover:text-acid transition-colors">{feature.title}</h3>
                <p className="relative z-10 text-white/50 font-mono leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-40 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative"
        >
          {/* Background aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-acid/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-16 overflow-hidden">
            <h2 className="font-display font-black text-5xl md:text-6xl text-white mb-6">
              Initiate <span className="text-acid">Sequence</span>
            </h2>
            <p className="text-white/50 font-mono text-xl mb-12 max-w-xl mx-auto">
              Join the elite tier of developers shipping at the speed of thought.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 px-12 py-6 bg-white text-black rounded-full font-mono font-bold text-xl hover:bg-acid hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(57,255,20,0.4)]"
            >
              <Mic size={24} className="animate-pulse" />
              Start Voice Console
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-4 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm font-mono text-white/40">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span className="text-white/60 font-bold tracking-widest text-lg">VOICEFORGE</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-acid opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-acid"></span>
            </span>
            <span className="text-acid/80 tracking-widest uppercase text-xs">Core Systems Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
