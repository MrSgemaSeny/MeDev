import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';
import { CheckCircle2 } from 'lucide-react';

export function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const setPlan = useAuthStore((state) => state.setPlan);

  useEffect(() => {
    if (sessionId) {
      setPlan('PRO');
    }
  }, [sessionId, setPlan]);

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
          <CheckCircle2 className="w-20 h-20" style={{ color: 'var(--color-accent)' }} />
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Payment Successful!</h1>
        <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Thank you for upgrading to PRO. Your account has been updated and you now have access to all premium features.
        </p>
        <Button
          onClick={() => navigate('/builder')}
          className="w-full text-white"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          Go to Resume Builder
        </Button>
      </div>
    </div>
  );
}
