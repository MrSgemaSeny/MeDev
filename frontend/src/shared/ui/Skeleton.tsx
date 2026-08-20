import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-tertiary, #21262d)',
        ...style,
      }}
      {...props}
    />
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-fade-in">
      <div className="flex items-center gap-6 pb-8 border-b border-[var(--color-border-default)]">
        <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 space-y-10 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
        <Skeleton className="h-5 w-full mx-auto" />
      </div>
      <div className="grid grid-cols-3 gap-8 py-8 border-y border-[var(--color-border-default)]">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    </div>
  );
};
