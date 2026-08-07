import * as React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'premium' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-zinc-50 text-zinc-950 hover:bg-zinc-200 shadow-none hover:shadow-none hover:-translate-y-0.5',
      outline: 'border border-zinc-700 bg-transparent hover:bg-zinc-900 text-zinc-100 hover:text-white shadow-none',
      ghost: 'hover:bg-zinc-900 text-zinc-400 hover:text-white',
      link: 'text-zinc-400 underline-offset-4 hover:underline',
      premium: 'bg-zinc-50 text-zinc-950 hover:bg-zinc-200 hover:-translate-y-0.5 hover:scale-[1.02]',
      glass: 'bg-transparent border border-zinc-700 text-white hover:bg-zinc-900 hover:-translate-y-0.5',
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
          'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 active:scale-95',
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
