import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { XCircle } from 'lucide-react';

export function CancelPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div
        className="rounded-xl p-8 max-w-md w-full text-center"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)' }}
      >
        <div className="flex justify-center mb-6">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Payment Cancelled</h1>
        <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Your checkout session was cancelled. No charges were made. You can try upgrading again whenever you're ready.
        </p>
        <Button
          onClick={() => navigate('/pricing')}
          className="w-full text-white"
          style={{ backgroundColor: 'var(--color-btn-hover)', color: 'var(--color-text-primary)' }}
        >
          Return to Pricing
        </Button>
      </div>
    </div>
  );
}
