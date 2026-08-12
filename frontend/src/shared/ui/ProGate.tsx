import React from 'react';
import { useAuthStore } from '../../entities/user/model/store';
import { Lock } from 'lucide-react';
import { Button } from './Button';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  blur?: boolean;
}

export const ProGate: React.FC<ProGateProps> = ({ children, fallback, blur = true }) => {
  const { plan } = useAuthStore();
  const isPro = plan === 'PRO';

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (blur) {
    return (
      <div className="relative overflow-hidden rounded-md border" style={{ borderColor: 'var(--color-border-default)' }}>
        <div className="blur-sm opacity-50 select-none pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center z-10">
          <div className="p-4 rounded-xl border shadow-lg max-w-sm w-full" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-default)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <Lock size={24} style={{ color: 'var(--color-text-primary)' }} />
            </div>
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>Pro Feature</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Upgrade to MeDev Pro to unlock this and other advanced features.
            </p>
            <Button variant="primary" className="w-full">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Simple inline fallback if not blurred
  return (
    <Button variant="outline" disabled className="w-full justify-center opacity-70">
      <Lock size={14} className="mr-2" />
      Pro Feature Locked
    </Button>
  );
};
