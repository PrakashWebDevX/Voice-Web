'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Star, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { apiClient } from '@/lib/api';
import HistoryCard from '@/components/HistoryCard';
import { HistoryCardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Generation {
  _id: string;
  title: string;
  prompt: string;
  codeType: string;
  language: string;
  tokensUsed: number;
  durationMs: number;
  isFavorited: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function HistoryPage() {
  const { user, getToken, loading } = useAuth();
  const router = useRouter();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/history');
  }, [user, loading, router]);

  const fetchHistory = useCallback(async (p = 1) => {
    if (!user) return;
    setFetching(true);
    try {
      const token = await getToken();
      const data = await apiClient<{ generations: Generation[]; pagination: Pagination }>(
        `/history?page=${p}&limit=12`,
        { token }
      );
      setGenerations(data.generations);
      setPagination(data.pagination);
      setPage(p);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setFetching(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (user) fetchHistory(1);
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      await apiClient(`/history/${id}`, { method: 'DELETE', token });
      setGenerations((prev) => prev.filter((g) => g._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleFavorite = async (id: string) => {
    try {
      const token = await getToken();
      const data = await apiClient<{ isFavorited: boolean }>(`/history/${id}/favorite`, {
        method: 'PATCH',
        token,
      });
      setGenerations((prev) =>
        prev.map((g) => (g._id === id ? { ...g, isFavorited: data.isFavorited } : g))
      );
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const filtered = generations.filter((g) => {
    const matchSearch =
      search === '' ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.prompt.toLowerCase().includes(search.toLowerCase());
    const matchFav = !filterFav || g.isFavorited;
    return matchSearch && matchFav;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal flex items-center justify-center">
        <div className="font-mono text-muted animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal bg-grid">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <History size={20} className="text-acid" />
            <div>
              <h1 className="font-display font-bold text-2xl text-white">Generation History</h1>
              <p className="text-muted font-mono text-sm">
                {pagination?.total ?? 0} total generations
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchHistory(page)}
            className="p-2 rounded-lg border border-border text-muted hover:text-white hover:border-border-bright transition-all"
          >
            <RefreshCw size={14} className={cn(fetching && 'animate-spin')} />
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search history…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-lg text-sm font-mono text-white placeholder:text-subtle focus:border-acid/50 focus:ring-1 focus:ring-acid/20 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setFilterFav(!filterFav)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-mono transition-all',
              filterFav
                ? 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10'
                : 'border-border text-muted hover:text-white'
            )}
          >
            <Star size={13} className={cn(filterFav && 'fill-yellow-400')} />
            Favorites
          </button>
        </motion.div>

        {/* Grid */}
        {fetching ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <HistoryCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-4xl mb-4">📭</div>
            <p className="font-mono text-muted">
              {search || filterFav ? 'No results match your filter.' : 'No generations yet.'}
            </p>
            {!search && !filterFav && (
              <a
                href="/dashboard"
                className="inline-block mt-4 text-sm font-mono text-acid hover:underline"
              >
                Generate something →
              </a>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((gen, i) => (
                <HistoryCard
                  key={gen._id}
                  generation={gen}
                  onDelete={handleDelete}
                  onFavorite={handleFavorite}
                  index={i}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchHistory(p)}
                className={cn(
                  'w-8 h-8 rounded font-mono text-sm transition-all',
                  p === page
                    ? 'bg-acid text-terminal font-bold'
                    : 'bg-surface-2 text-muted border border-border hover:border-border-bright hover:text-white'
                )}
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
