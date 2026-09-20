import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F52F3A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#F52F3A] hover:bg-[#d9232d] text-white shadow-lg shadow-[#F52F3A]/25 hover:shadow-[#F52F3A]/40 border border-transparent',
    secondary:
      'bg-white/10 hover:bg-white/15 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm',
    outline:
      'bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700',
    ghost:
      'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white',
    danger:
      'bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      {children}
    </button>
  );
}
