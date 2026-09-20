import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'minimal' | 'glass' | 'interactive' | 'glow';
  className?: string;
}

export function GlassCard({
  children,
  variant = 'minimal',
  className = '',
  ...props
}: GlassCardProps) {
  // 90% minimal solid surface + 10% tasteful glass accent
  const baseStyles = 'rounded-2xl transition-all duration-300 relative';

  const variantStyles = {
    minimal:
      'bg-white dark:bg-[#111111] border border-black/[0.08] dark:border-white/[0.08] shadow-sm',
    glass:
      'bg-white/70 dark:bg-white/[0.04] backdrop-blur-md border border-black/[0.08] dark:border-white/[0.10] shadow-sm',
    interactive:
      'bg-white dark:bg-[#111111] hover:bg-zinc-50 dark:hover:bg-[#151515] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/15 dark:hover:border-white/20 hover:shadow-md hover:-translate-y-0.5',
    glow:
      'bg-white/80 dark:bg-[#111111]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.10] hover:border-[#F52F3A]/40 shadow-sm hover:shadow-lg hover:shadow-[#F52F3A]/5 transition-all',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
