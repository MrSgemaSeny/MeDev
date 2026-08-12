import * as React from 'react';
import { cn } from '../lib/utils';
import { Input } from './Input';

export { Input };

const fieldBase =
  'flex w-full rounded-md px-3 py-1.5 text-sm transition-[border-color,box-shadow] ' +
  'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, onFocus, onBlur, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(fieldBase, 'py-2 leading-5', className)}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-default)',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-default)';
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--color-text-muted)';
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-default)';
          e.currentTarget.style.boxShadow = 'none';
          onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, style, onFocus, onBlur, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(fieldBase, 'h-9 cursor-pointer', className)}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-default)',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-default)';
          e.currentTarget.style.boxShadow = '0 0 0 1px var(--color-text-muted)';
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-default)';
          e.currentTarget.style.boxShadow = 'none';
          onBlur?.(e);
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-xs font-medium mb-1', className)}
        style={{ color: 'var(--color-text-secondary)' }}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = 'Label';

export interface FieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const Field = ({ label, htmlFor, children, className }: FieldProps) => (
  <div className={className}>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
  </div>
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-md', className)}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'accent' | 'danger';
}

export const Badge = ({ tone = 'default', className, style, children, ...props }: BadgeProps) => {
  const toneStyle: React.CSSProperties =
    tone === 'accent'
      ? {
          backgroundColor: 'var(--color-accent-muted)',
          color: 'var(--color-accent)',
          border: '1px solid var(--color-accent-muted)',
        }
      : tone === 'danger'
      ? {
          backgroundColor: 'transparent',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-danger)',
        }
      : {
          backgroundColor: 'var(--color-btn-hover)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border-default)',
        };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        className
      )}
      style={{ ...toneStyle, ...style }}
      {...props}
    >
      {children}
    </span>
  );
};

export const Spinner = ({ className }: { className?: string }) => (
  <span
    className={cn('inline-block animate-spin rounded-full border-2 border-current', className)}
    style={{
      borderTopColor: 'transparent',
      width: '1em',
      height: '1em',
      color: 'var(--color-text-muted)',
    }}
    aria-label="loading"
  />
);
