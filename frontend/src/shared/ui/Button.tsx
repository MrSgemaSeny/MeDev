import * as React from 'react';
import { cn } from '../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] md:min-h-[32px] h-9 md:h-8 px-3 text-xs gap-1.5',
  md: 'min-h-[44px] md:min-h-[36px] h-11 md:h-9 px-3.5 md:px-3 text-sm gap-2',
  lg: 'min-h-[48px] md:min-h-[40px] h-12 md:h-10 px-4 text-base md:text-sm gap-2',
  icon: 'min-h-[44px] min-w-[44px] md:min-h-[32px] md:min-w-[32px] h-11 w-11 md:h-8 md:w-8 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', style, ...props }, ref) => {
    const variantStyle: React.CSSProperties =
      variant === 'primary'
        ? {
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
            border: '1px solid transparent',
          }
        : variant === 'danger'
        ? {
            backgroundColor: 'var(--color-danger)',
            color: '#ffffff',
            border: '1px solid transparent',
          }
        : variant === 'outline'
        ? {
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
          }
        : variant === 'ghost'
        ? {
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid transparent',
          }
        : {
            backgroundColor: 'var(--color-btn-bg)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-btn-border)',
          };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium cursor-pointer',
          'transition-[background-color,border-color,color] duration-100',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-link)]',
          'disabled:pointer-events-none disabled:opacity-60',
          sizeClasses[size],
          className
        )}
        style={{ ...variantStyle, ...style }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
