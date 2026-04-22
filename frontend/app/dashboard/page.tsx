'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { useStreaming } from '@/lib/useStreaming';
import { apiClient, downloadZip } from '@/lib/api';
import GenerateForm, { CodeType } from '@/components/GenerateForm';
import CodeEditor from '@/components/CodeEditor';
import { CodeSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import toast from 'react-hot-toast';

function DashboardContent() {
  const { user, profile, getToken, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { streamedCode, status, error, result, startStream, reset } = useStreaming();

  const [currentCodeType, setCurrentCodeType] = useState<CodeType>('html-website');
  const [currentTitle, setCurrentTitle] = useState('Generated Code');
  const [explanation, setExplanation] = useState<string | undefined>();
  const [isExplaining, setIsExplaining] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, loading, router]);

  // Show upgrade success toast
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      toast.success('🎉 Welcome to Pro! Unlimited generations unlocked.');
      refreshProfile();
    }
  }, [searchParams]);

  const handleGenerate = async (prompt: string, codeType: CodeType) => {
    if (!user) return;

    if (profile?.plan === 'free' && profile.generationsUsed >= profile.generationsLimit) {
      toast.error('Free limit reached. Upgrade to Pro for unlimited generations.');
      router.push('/pricing');
      return;
    }

    setCurrentCodeType(codeType);
    setCurrentTitle('Generating…');
    setExplanation(undefined);
    reset();

    const token = await getToken();
    if (!token) return;

    startStream(prompt, codeType, token);
  };

  useEffect(() => {
    if (result?.title) {
      setCurrentTitle(result.title);
      refreshProfile();
    }
  }, [result]);

  const handleExplain = async () => {
    if (!streamedCode || isExplaining) return;
    setIsExplaining(true);
    try {
      const token = await getToken();
      const data = await apiClient<{ explanation: string }>('/generate/explain', {
        method: 'POST',
        token,
        body: { code: streamedCode, generationId: result?.generationId },
      });
      setExplanation(data.explanation);
      toast.success('Explanation ready!');
    } catch {
      toast.error('Failed to explain code');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDownload = async () => {
    if (!streamedCode) return;
    try {
      const token = await getToken();
      if (!token) return;
      await downloadZip(streamedCode, currentCodeType, currentTitle, token);
      toast.success('Download started!');
    } catch {
      toast.error('Download failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal flex items-center justify-center">
        <div className="font-mono text-muted animate-pulse">Loading…</div>
      </div>
    );
  }

  const isGenerating = status === 'streaming';
  const hasOutput = streamedCode.length > 0;
  const isFree = profile?.plan === 'free';
  const remaining = isFree
    ? Math.max(0, (profile?.generationsLimit ?? 5) - (profile?.generationsUsed ?? 0))
    : null;

  return (
    <div className="min-h-screen bg-terminal bg-grid">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Code Generator
            </h1>
            <p className="text-muted font-mono text-sm mt-1">
              Speak or type — get production-ready code
            </p>
          </div>

          {/* Usage indicator */}
          {isFree && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-mono text-muted">Free generations</div>
                <div className="text-sm font-mono font-bold text-white">
                  {remaining} / {profile?.generationsLimit} left
                </div>
              </div>
              <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-acid rounded-full transition-all"
                  style={{
                    width: `${((profile?.generationsUsed ?? 0) / (profile?.generationsLimit ?? 5)) * 100}%`,
                  }}
                />
              </div>
              {remaining === 0 && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 text-xs font-mono text-acid border border-acid/40 bg-acid/10 px-2.5 py-1.5 rounded-lg hover:glow-acid transition-all"
                >
                  <Zap size={10} className="fill-acid" />
                  Upgrade
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Limit warning */}
        {isFree && remaining !== null && remaining <= 1 && remaining > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm font-mono text-yellow-400"
          >
            <AlertTriangle size={14} />
            <span>Only {remaining} free generation{remaining !== 1 ? 's' : ''} left.</span>
            <Link href="/pricing" className="ml-auto flex items-center gap-1 underline underline-offset-4 hover:text-yellow-300">
              Upgrade to Pro <ChevronRight size={12} />
            </Link>
          </motion.div>
        )}

        {/* Generate form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-6"
        >
          <GenerateForm
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            disabled={isFree && remaining === 0}
          />
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm font-mono text-red-400"
            >
              <AlertTriangle size={14} />
              <span>{error}</span>
              {error.includes('limit') && (
                <Link href="/pricing" className="ml-auto underline hover:text-red-300">
                  Upgrade →
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streaming skeleton */}
        {isGenerating && !hasOutput && <CodeSkeleton />}

        {/* Code output */}
        <AnimatePresence>
          {hasOutput && (
            <div className="space-y-4">
              <CodeEditor
                code={streamedCode}
                codeType={currentCodeType}
                title={currentTitle}
                explanation={explanation}
                onExplain={status === 'complete' ? handleExplain : undefined}
                onDownload={status === 'complete' ? handleDownload : undefined}
                isExplaining={isExplaining}
                streaming={isGenerating}
              />

              {/* Generation stats */}
              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 text-xs font-mono text-subtle px-2"
                >
                  <span className="text-acid">✓ Complete</span>
                  <span>{result.tokensUsed.toLocaleString()} tokens</span>
                  <span>{(result.durationMs / 1000).toFixed(1)}s</span>
                  {result.remainingGenerations !== null && (
                    <span className="text-yellow-500/70">
                      {result.remainingGenerations} generations remaining
                    </span>
                  )}
                  <Link href="/history" className="ml-auto text-muted hover:text-white transition-colors">
                    View in history →
                  </Link>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-terminal flex items-center justify-center">
        <div className="font-mono text-muted animate-pulse">Loading…</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}