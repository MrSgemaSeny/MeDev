import * as React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'premium' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5',
      outline: 'border border-zinc-700 bg-zinc-950/50 backdrop-blur-sm hover:bg-zinc-800 text-zinc-100 hover:text-white shadow-sm hover:shadow-md',
      ghost: 'hover:bg-white/10 text-zinc-300 hover:text-white',
      link: 'text-indigo-400 underline-offset-4 hover:underline',
      premium: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 hover:scale-[1.02] border border-white/20',
      glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:-translate-y-0.5 shadow-lg',
    };

    const sizes = {
      default: 'h-10 px-5 py-2',
      sm: 'h-9 rounded-md px-3 text-xs',
      lg: 'h-12 rounded-lg px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button };
