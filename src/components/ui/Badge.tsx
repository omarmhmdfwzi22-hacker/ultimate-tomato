import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'tomato' | 'success' | 'warning' | 'outline' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-3 py-1 font-semibold',
  };

  const variantStyles = {
    default:
      'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10',
    tomato:
      'bg-[#F52F3A]/10 text-[#F52F3A] border border-[#F52F3A]/20',
    danger:
      'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
    info:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    success:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    outline:
      'bg-transparent text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
