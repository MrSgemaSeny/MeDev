import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const inputBase =
  'flex w-full rounded-md px-3 py-1.5 text-sm font-normal transition-[border-color,box-shadow] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:border-transparent ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:border-transparent ' +
  'disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-[var(--color-text-muted)]';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', style, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(inputBase, 'h-9', className)}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-default)',
          ...style,
        }}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
