import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../entities/user/model/store';
import { Button } from '../../shared/ui/Button';

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
          Payment successful
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Your account has been upgraded to PRO. You now have access to all premium features.
        </p>
        <Button variant="primary" className="w-full" onClick={() => navigate('/resume')}>
          Go to Resume Builder
        </Button>
      </div>
    </div>
  );
}
