'use client';

import { motion } from 'framer-motion';
import { Clock, Star, Trash2, Eye, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TYPE_ICONS: Record<string, string> = {
  'html-website': '🌐',
  'react-component': '⚛️',
  'nextjs-page': '▲',
  'node-express-api': '🟢',
  'python-script': '🐍',
  'arduino-code': '🔌',
  'full-stack': '🏗️',
};

const TYPE_COLORS: Record<string, string> = {
  'html-website': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  'react-component': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  'nextjs-page': 'text-white border-white/20 bg-white/10',
  'node-express-api': 'text-green-400 border-green-400/30 bg-green-400/10',
  'python-script': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  'arduino-code': 'text-teal-400 border-teal-400/30 bg-teal-400/10',
  'full-stack': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

interface HistoryCardProps {
  generation: {
    _id: string;
    title: string;
    prompt: string;
    codeType: string;
    language: string;
    tokensUsed: number;
    durationMs: number;
    isFavorited: boolean;
    createdAt: string;
  };
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  index: number;
}

export default function HistoryCard({
  generation,
  onDelete,
  onFavorite,
  index,
}: HistoryCardProps) {
  const timeAgo = formatTimeAgo(new Date(generation.createdAt));
  const typeColor = TYPE_COLORS[generation.codeType] || 'text-muted border-border';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group bg-surface border border-border hover:border-border-bright rounded-xl p-4 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{TYPE_ICONS[generation.codeType] || '💻'}</span>
          <h3 className="font-mono font-semibold text-sm text-white truncate">
            {generation.title}
          </h3>
        </div>
        <span className={cn('text-xs font-mono px-2 py-0.5 rounded border shrink-0', typeColor)}>
          {generation.language}
        </span>
      </div>

      <p className="text-xs text-muted font-mono leading-relaxed line-clamp-2 mb-4">
        {generation.prompt}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-mono text-subtle">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo}
          </span>
          <span>{generation.tokensUsed.toLocaleString()} tokens</span>
          <span>{(generation.durationMs / 1000).toFixed(1)}s</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onFavorite(generation._id)}
            className={cn(
              'p-1.5 rounded border transition-all',
              generation.isFavorited
                ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                : 'text-muted border-border hover:text-yellow-400 hover:border-yellow-400/30'
            )}
          >
            <Star size={12} className={cn(generation.isFavorited && 'fill-yellow-400')} />
          </button>

          <Link
            href={`/history/${generation._id}`}
            className="p-1.5 rounded border border-border text-muted hover:text-acid hover:border-acid/30 transition-all"
          >
            <Eye size={12} />
          </Link>

          <button
            onClick={() => onDelete(generation._id)}
            className="p-1.5 rounded border border-border text-muted hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
