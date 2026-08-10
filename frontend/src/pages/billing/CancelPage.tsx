import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';

export function CancelPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg-canvas)' }}
    >
      <div
        className="rounded-md p-8 max-w-md w-full text-center"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Payment cancelled
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Your checkout session was cancelled. No charges were made. You can try upgrading again
          whenever you're ready.
        </p>
        <Button variant="secondary" className="w-full" onClick={() => navigate('/billing')}>
          Return to Pricing
        </Button>
      </div>
    </div>
  );
}
