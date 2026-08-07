import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-full border border-zinc-700 bg-transparent px-5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-all duration-300',
          'hover:border-zinc-500',
          'focus-visible:outline-none focus-visible:border-zinc-300 focus-visible:ring-1 focus-visible:ring-zinc-300',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
