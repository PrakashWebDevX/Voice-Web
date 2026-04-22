'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, History, CreditCard, LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Generate' },
    { href: '/history', label: 'History' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border bg-terminal/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 border border-acid rounded flex items-center justify-center glow-acid group-hover:glow-acid-strong transition-all">
            <Zap size={14} className="text-acid fill-acid" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Voice<span className="text-acid glow-acid-text">Forge</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-1.5 text-sm font-mono rounded transition-all',
                pathname === link.href
                  ? 'text-acid bg-acid/10 border border-acid/30'
                  : 'text-muted hover:text-white hover:bg-surface-2'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {profile && (
            <span className={cn(
              'hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border',
              profile.plan === 'pro'
                ? 'text-acid border-acid/40 bg-acid/10'
                : 'text-muted border-border'
            )}>
              {profile.plan === 'pro' ? (
                <><Zap size={10} className="fill-acid text-acid" /> PRO</>
              ) : (
                <>{profile.generationsUsed}/{profile.generationsLimit} free</>
              )}
            </span>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:border-border-bright bg-surface hover:bg-surface-2 transition-all text-sm font-mono"
              >
                <div className="w-5 h-5 rounded-full bg-acid/20 border border-acid/40 flex items-center justify-center">
                  <User size={11} className="text-acid" />
                </div>
                <span className="hidden sm:block max-w-[120px] truncate text-xs">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown size={12} className="text-muted" />
              </button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-surface-2 border border-border rounded-lg shadow-xl overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs text-muted font-mono truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/history"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-surface-3 transition-colors"
                  >
                    <History size={14} className="text-muted" />
                    <span>History</span>
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-surface-3 transition-colors"
                  >
                    <CreditCard size={14} className="text-muted" />
                    <span>Billing</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-border"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm font-mono bg-acid text-terminal rounded font-bold hover:bg-acid-dim transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
