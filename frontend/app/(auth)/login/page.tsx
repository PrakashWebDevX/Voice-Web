'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Mail, Lock, Github, Chrome } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push(redirect);
    } catch (err: any) {
      const msg =
        err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.message || 'Sign in failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGithub();
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.message || 'OAuth sign in failed');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-terminal bg-grid flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 border border-acid rounded flex items-center justify-center glow-acid">
              <Zap size={16} className="text-acid fill-acid" />
            </div>
            <span className="font-display font-bold text-xl">
              Voice<span className="text-acid">Forge</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
          <p className="text-muted font-mono text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
          {/* OAuth */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-surface-2 border border-border hover:border-border-bright rounded-xl font-mono text-sm text-white transition-all disabled:opacity-60"
            >
              <Chrome size={16} className="text-blue-400" />
              {oauthLoading === 'google' ? 'Signing in…' : 'Continue with Google'}
            </button>
            <button
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-surface-2 border border-border hover:border-border-bright rounded-xl font-mono text-sm text-white transition-all disabled:opacity-60"
            >
              <Github size={16} />
              {oauthLoading === 'github' ? 'Signing in…' : 'Continue with GitHub'}
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-subtle">
            <div className="flex-1 h-px bg-border" />
            or continue with email
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-mono text-white placeholder:text-subtle focus:border-acid/50 focus:ring-1 focus:ring-acid/20 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-mono text-white placeholder:text-subtle focus:border-acid/50 focus:ring-1 focus:ring-acid/20 outline-none transition-all"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                'w-full py-2.5 rounded-xl font-mono font-bold text-sm transition-all',
                loading || !email || !password
                  ? 'bg-surface-2 text-muted border border-border cursor-not-allowed'
                  : 'bg-acid text-terminal hover:bg-acid-dim glow-acid'
              )}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm font-mono text-muted mt-6">
          No account?{' '}
          <Link href="/signup" className="text-acid hover:underline underline-offset-4">
            Sign up free →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
