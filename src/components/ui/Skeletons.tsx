import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-200 dark:bg-white/10 ${className}`} />;
}

export function ProjectSkeleton() {
  return (
    <div className="rounded-2xl bg-zinc-100 dark:bg-[#111111] border border-black/5 dark:border-white/5 p-4 animate-pulse space-y-4">
      <div className="aspect-video bg-zinc-200 dark:bg-white/5 rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 bg-zinc-200 dark:bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-zinc-200 dark:bg-white/5 rounded w-full" />
        <div className="h-3 bg-zinc-200 dark:bg-white/5 rounded w-2/3" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-5 bg-zinc-200 dark:bg-white/5 rounded-full w-16" />
        <div className="h-5 bg-zinc-200 dark:bg-white/5 rounded-full w-14" />
      </div>
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="rounded-2xl bg-zinc-100 dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6 animate-pulse space-y-3">
      <div className="h-3 bg-zinc-200 dark:bg-white/10 rounded w-1/3" />
      <div className="h-8 bg-zinc-200 dark:bg-white/10 rounded w-1/2" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8 animate-pulse">
      <div className="h-10 bg-zinc-200 dark:bg-white/10 rounded-xl w-1/3" />
      <div className="h-4 bg-zinc-200 dark:bg-white/5 rounded w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <ProjectSkeleton />
        <ProjectSkeleton />
        <ProjectSkeleton />
      </div>
    </div>
  );
}
