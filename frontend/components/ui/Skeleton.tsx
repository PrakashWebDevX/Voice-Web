'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-2 rounded',
        className
      )}
    />
  );
}

export function CodeSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-surface">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="w-3 h-3 rounded-full" />
          </div>
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-20 h-5 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-7 rounded" />
          <Skeleton className="w-16 h-7 rounded" />
        </div>
      </div>
      {/* Code skeleton */}
      <div className="p-4 space-y-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-5 h-4 shrink-0" />
            <Skeleton
              className="h-4"
              style={{ width: `${Math.random() * 40 + 40}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="w-48 h-5" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-full h-12 rounded" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
    </div>
  );
}
